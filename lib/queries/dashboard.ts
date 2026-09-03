import { createClient } from "@/lib/supabase/server"
import { currentMonthKey, todayISO, isPastDue } from "@/lib/dates"
import {
  revenueForMonth,
  costsForMonth,
  mrr,
  subscriptionMrr,
  unpaidTotal,
  unpaidCount,
  netBurnPaise,
  runwayMonths,
} from "@/lib/metrics/finance"
import { pipelineValue, weightedPipelineValue } from "@/lib/metrics/pipeline"
import { deriveInvoiceStatus } from "@/lib/metrics/invoice-status"
import {
  billableValuePaise,
  totalMinutes,
  minutesToHours,
  utilization,
} from "@/lib/metrics/timesheets"
import { sumPaise } from "@/lib/money"
import type { Enums } from "@/lib/types/database"

export type FollowUp = {
  id: string
  body: string | null
  type: Enums<"activity_type">
  due_date: string | null
}

export type DashboardData = {
  cashPaise: number
  monthlyRevenuePaise: number
  monthlyBurnPaise: number
  netBurnPaise: number
  runwayMonths: number | null
  pipelinePaise: number
  weightedPipelinePaise: number
  /** MRR shown on the dashboard — subscriptions are the source of truth. */
  mrrPaise: number
  /** Recurring-invoice MRR, kept for reference/back-compat. */
  invoiceMrrPaise: number
  subscriptionMrrPaise: number
  openQuotesCount: number
  openQuotesValuePaise: number
  billableHoursThisMonth: number
  billableValueThisMonthPaise: number
  utilizationThisMonth: number
  unpaidPaise: number
  unpaidInvoiceCount: number
  overdueInvoiceCount: number
  activeProjectCount: number
  followUpsDueToday: FollowUp[]
  overdueFollowUps: FollowUp[]
}

const ACTIVE_PROJECT_STATUSES: Enums<"project_status">[] = [
  "not_started",
  "in_progress",
  "review",
  "support",
]

const OPEN_QUOTE_STATUSES: Enums<"quote_status">[] = [
  "draft",
  "sent",
  "accepted",
]

/** Fetches the org's data (RLS-scoped to the session) and derives dashboard metrics. */
export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()
  const today = todayISO()
  const month = currentMonthKey()

  const [
    dealsRes,
    invoicesRes,
    paymentsRes,
    costsRes,
    projectsRes,
    activitiesRes,
    settingsRes,
    subscriptionsRes,
    quotesRes,
    timeEntriesRes,
  ] = await Promise.all([
    supabase.from("deals").select("stage,value_paise"),
    supabase
      .from("invoices")
      .select("id,status,amount_paise,is_recurring,recurring_interval,due_date"),
    supabase.from("payments").select("invoice_id,amount_paise,paid_at"),
    supabase.from("costs").select("amount_paise,incurred_on"),
    supabase.from("projects").select("status"),
    supabase.from("activities").select("id,body,type,due_date,done"),
    supabase
      .from("org_settings")
      .select("cash_balance_paise,monthly_burn_paise")
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("status,amount_paise,interval")
      .eq("status", "active"),
    supabase
      .from("quotes")
      .select("status,total_paise")
      .in("status", OPEN_QUOTE_STATUSES),
    supabase
      .from("time_entries")
      .select("project_id,minutes,billable,rate_paise,work_date")
      .gte("work_date", `${month}-01`)
      .lt("work_date", nextMonthStart(month)),
  ])

  const deals = dealsRes.data ?? []
  const invoices = invoicesRes.data ?? []
  const payments = paymentsRes.data ?? []
  const costs = costsRes.data ?? []
  const projects = projectsRes.data ?? []
  const activities = activitiesRes.data ?? []
  const settings = settingsRes.data
  const subscriptions = subscriptionsRes.data ?? []
  const quotes = quotesRes.data ?? []
  const timeEntries = timeEntriesRes.data ?? []

  const paidByInvoice = new Map<string, number>()
  for (const p of payments) {
    paidByInvoice.set(p.invoice_id, (paidByInvoice.get(p.invoice_id) ?? 0) + p.amount_paise)
  }

  const invoicesWithPaid = invoices.map((i) => ({
    status: i.status,
    amount_paise: i.amount_paise,
    paid_paise: paidByInvoice.get(i.id) ?? 0,
  }))

  const overdueInvoiceCount = invoices.filter(
    (i) =>
      deriveInvoiceStatus(
        { status: i.status, amount_paise: i.amount_paise, due_date: i.due_date },
        paidByInvoice.get(i.id) ?? 0,
        today
      ) === "overdue"
  ).length

  const subscriptionMrrPaise = subscriptionMrr(subscriptions)
  const openQuotesCount = quotes.length
  const openQuotesValuePaise = sumPaise(quotes.map((q) => q.total_paise))

  const billableHoursThisMonth = minutesToHours(totalMinutes(timeEntries))
  const billableValueThisMonthPaise = billableValuePaise(timeEntries)
  const utilizationThisMonth = utilization(timeEntries)

  const monthlyRevenuePaise = revenueForMonth(payments, month)
  const computedBurn = costsForMonth(costs, month)
  const monthlyBurnPaise = settings?.monthly_burn_paise ?? computedBurn
  const net = netBurnPaise(monthlyBurnPaise, monthlyRevenuePaise)
  const cashPaise = settings?.cash_balance_paise ?? 0

  const followUpsDueToday = activities
    .filter((a) => !a.done && a.due_date === today)
    .map(toFollowUp)
  const overdueFollowUps = activities
    .filter((a) => !a.done && isPastDue(a.due_date, today))
    .map(toFollowUp)

  return {
    cashPaise,
    monthlyRevenuePaise,
    monthlyBurnPaise,
    netBurnPaise: net,
    runwayMonths: runwayMonths(cashPaise, net),
    pipelinePaise: pipelineValue(deals),
    weightedPipelinePaise: weightedPipelineValue(deals),
    // Subscriptions are the source of truth for MRR on the dashboard.
    mrrPaise: subscriptionMrrPaise,
    invoiceMrrPaise: mrr(invoices),
    subscriptionMrrPaise,
    openQuotesCount,
    openQuotesValuePaise,
    billableHoursThisMonth,
    billableValueThisMonthPaise,
    utilizationThisMonth,
    unpaidPaise: unpaidTotal(invoicesWithPaid),
    unpaidInvoiceCount: unpaidCount(invoicesWithPaid),
    overdueInvoiceCount,
    activeProjectCount: projects.filter((p) =>
      ACTIVE_PROJECT_STATUSES.includes(p.status)
    ).length,
    followUpsDueToday,
    overdueFollowUps,
  }
}

/** First day (YYYY-MM-DD) of the month after the given 'YYYY-MM' key. */
function nextMonthStart(month: string): string {
  const [year, mon] = month.split("-").map(Number)
  const nextYear = mon === 12 ? year + 1 : year
  const nextMon = mon === 12 ? 1 : mon + 1
  return `${nextYear}-${String(nextMon).padStart(2, "0")}-01`
}

function toFollowUp(a: {
  id: string
  body: string | null
  type: Enums<"activity_type">
  due_date: string | null
}): FollowUp {
  return { id: a.id, body: a.body, type: a.type, due_date: a.due_date }
}
