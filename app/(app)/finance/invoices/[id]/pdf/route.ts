import { createClient } from "@/lib/supabase/server"
import { requireOrgContext } from "@/lib/auth"
import { subtotalPaise } from "@/lib/metrics/line-items"
import {
  renderDocumentHtml,
  type DocLineItem,
  type PrintableDocument,
} from "@/lib/documents/printable"

/**
 * GET /finance/invoices/[id]/pdf
 * Serves a self-contained, print-to-PDF HTML document for one invoice. When the
 * invoice has line items they drive the table + subtotal; otherwise a single
 * synthetic line is derived from the invoice amount so the document is never
 * empty. The invoice's authoritative `amount_paise` is always the grand total.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireOrgContext()
  const supabase = await createClient()

  const [invoiceRes, itemsRes] = await Promise.all([
    supabase
      .from("invoices")
      .select(
        "number, status, amount_paise, issue_date, due_date, notes, clients(name)"
      )
      .eq("id", id)
      .eq("org_id", ctx.orgId)
      .maybeSingle(),
    supabase
      .from("invoice_items")
      .select("description, quantity, unit_price_paise, amount_paise")
      .eq("invoice_id", id)
      .eq("org_id", ctx.orgId)
      .order("position", { ascending: true }),
  ])

  const invoice = invoiceRes.data
  if (!invoice) {
    return new Response("Invoice not found", { status: 404 })
  }

  const rows = itemsRes.data ?? []

  const items: DocLineItem[] =
    rows.length > 0
      ? rows.map((r) => ({
          description: r.description,
          quantity: r.quantity,
          unit_price_paise: r.unit_price_paise,
          amount_paise: r.amount_paise,
        }))
      : [
          {
            description: invoice.notes || "Services",
            quantity: 1,
            unit_price_paise: invoice.amount_paise,
            amount_paise: invoice.amount_paise,
          },
        ]

  const doc: PrintableDocument = {
    kind: "Invoice",
    number: invoice.number,
    status: invoice.status,
    orgName: ctx.orgName,
    clientName: invoice.clients?.name ?? "—",
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    validUntil: undefined,
    items,
    subtotalPaise: subtotalPaise(items),
    totalPaise: invoice.amount_paise,
    notes: invoice.notes,
  }

  return new Response(renderDocumentHtml(doc), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
