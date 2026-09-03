import { monthKey } from "@/lib/dates"
import { sumPaise, type Paise } from "@/lib/money"
import { outstandingPaise } from "@/lib/metrics/invoice-status"
import type { Enums } from "@/lib/types/database"

export type PaymentLike = { amount_paise: number; paid_at: string }
export type CostLike = { amount_paise: number; incurred_on: string }

export type RecurringInvoiceLike = {
  status: Enums<"invoice_status">
  amount_paise: number
  is_recurring: boolean
  recurring_interval: Enums<"recurring_interval"> | null
}

export type InvoiceWithPaid = {
  status: Enums<"invoice_status">
  amount_paise: number
  paid_paise: number
}

export type SubscriptionLike = {
  status: Enums<"subscription_status">
  amount_paise: number
  interval: Enums<"recurring_interval">
}

/** Sum of payments received in the given 'YYYY-MM' (app timezone). */
export function revenueForMonth(
  payments: PaymentLike[],
  monthKeyStr: string,
  tz?: string
): Paise {
  return sumPaise(
    payments
      .filter((p) => monthKey(p.paid_at, tz) === monthKeyStr)
      .map((p) => p.amount_paise)
  )
}

/** Sum of costs incurred in the given 'YYYY-MM' (app timezone). */
export function costsForMonth(
  costs: CostLike[],
  monthKeyStr: string,
  tz?: string
): Paise {
  return sumPaise(
    costs
      .filter((c) => monthKey(c.incurred_on, tz) === monthKeyStr)
      .map((c) => c.amount_paise)
  )
}

/** Normalize a recurring interval to a per-month multiplier. */
const MONTHLY_FACTOR: Record<Enums<"recurring_interval">, number> = {
  weekly: 52 / 12,
  monthly: 1,
  quarterly: 1 / 3,
  yearly: 1 / 12,
}

/**
 * Monthly Recurring Revenue: recurring invoices normalized to a monthly figure.
 * Draft and cancelled invoices are excluded.
 */
export function mrr(invoices: RecurringInvoiceLike[]): Paise {
  const total = invoices
    .filter(
      (i) =>
        i.is_recurring &&
        i.recurring_interval !== null &&
        i.status !== "draft" &&
        i.status !== "cancelled"
    )
    .reduce(
      (acc, i) =>
        acc + i.amount_paise * MONTHLY_FACTOR[i.recurring_interval!],
      0
    )
  return Math.round(total)
}

/**
 * Monthly Recurring Revenue from subscriptions (the source of truth for MRR).
 * Only `active` subscriptions count; each amount is normalized to a monthly
 * figure using the same per-interval factors as {@link mrr}.
 */
export function subscriptionMrr(subs: SubscriptionLike[]): Paise {
  const total = subs
    .filter((s) => s.status === "active")
    .reduce((acc, s) => acc + s.amount_paise * MONTHLY_FACTOR[s.interval], 0)
  return Math.round(total)
}

/** Total still owed across all non-draft, non-cancelled, not-fully-paid invoices. */
export function unpaidTotal(invoices: InvoiceWithPaid[]): Paise {
  return sumPaise(
    invoices
      .filter(
        (i) =>
          i.status !== "draft" &&
          i.status !== "cancelled" &&
          i.status !== "paid"
      )
      .map((i) => outstandingPaise(i.amount_paise, i.paid_paise))
  )
}

/** Count of invoices with any outstanding balance (excl. draft/cancelled/paid). */
export function unpaidCount(invoices: InvoiceWithPaid[]): number {
  return invoices.filter(
    (i) =>
      i.status !== "draft" &&
      i.status !== "cancelled" &&
      i.status !== "paid" &&
      outstandingPaise(i.amount_paise, i.paid_paise) > 0
  ).length
}

/** Net monthly burn = costs − revenue. Positive means cash is being spent. */
export function netBurnPaise(
  monthlyCostsPaise: Paise,
  monthlyRevenuePaise: Paise
): Paise {
  return monthlyCostsPaise - monthlyRevenuePaise
}

/**
 * Runway in months = cash / net monthly burn.
 * Returns null when not burning (net burn <= 0) — i.e. effectively infinite.
 */
export function runwayMonths(
  cashPaise: Paise,
  monthlyNetBurnPaise: Paise
): number | null {
  if (monthlyNetBurnPaise <= 0) return null
  return cashPaise / monthlyNetBurnPaise
}
