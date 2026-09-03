import { isPastDue } from "@/lib/dates"
import type { Enums } from "@/lib/types/database"

export type InvoiceStatus = Enums<"invoice_status">

export type InvoiceForStatus = {
  status: InvoiceStatus
  amount_paise: number
  due_date: string | null
}

/**
 * Effective invoice status from the stored status, total paid, and "today".
 *
 * Precedence:
 *   1. draft / cancelled are terminal stored states — never auto-changed.
 *   2. fully paid (paid >= amount, amount > 0) → 'paid'
 *   3. past due (due_date < today) and not fully paid → 'overdue'
 *   4. some paid (0 < paid < amount) → 'partially_paid'
 *   5. otherwise keep the stored status (typically 'sent')
 */
export function deriveInvoiceStatus(
  invoice: InvoiceForStatus,
  paidPaise: number,
  todayISOStr: string
): InvoiceStatus {
  const { status, amount_paise, due_date } = invoice

  if (status === "draft" || status === "cancelled") return status
  if (amount_paise > 0 && paidPaise >= amount_paise) return "paid"
  if (isPastDue(due_date, todayISOStr)) return "overdue"
  if (paidPaise > 0) return "partially_paid"
  return status
}

/** Amount still owed on an invoice (never negative). */
export function outstandingPaise(amountPaise: number, paidPaise: number): number {
  return Math.max(0, amountPaise - paidPaise)
}
