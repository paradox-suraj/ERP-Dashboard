import { sumPaise, type Paise } from "@/lib/money"
import type { Enums } from "@/lib/types/database"

export type InvoiceForProfit = {
  status: Enums<"invoice_status">
  amount_paise: number
}
export type CostForProfit = { amount_paise: number }

export type ProjectProfit = {
  revenuePaise: Paise
  costPaise: Paise
  profitPaise: Paise
  /** Gross margin as a percentage (0 when there is no revenue). */
  marginPct: number
}

/**
 * Gross project profit: billed revenue (non-draft, non-cancelled invoices)
 * minus all recorded costs.
 */
export function projectProfit(
  invoices: InvoiceForProfit[],
  costs: CostForProfit[]
): ProjectProfit {
  const revenuePaise = sumPaise(
    invoices
      .filter((i) => i.status !== "cancelled" && i.status !== "draft")
      .map((i) => i.amount_paise)
  )
  const costPaise = sumPaise(costs.map((c) => c.amount_paise))
  const profitPaise = revenuePaise - costPaise
  const marginPct = revenuePaise > 0 ? (profitPaise / revenuePaise) * 100 : 0
  return { revenuePaise, costPaise, profitPaise, marginPct }
}
