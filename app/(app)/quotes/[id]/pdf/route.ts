import { notFound } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { requireOrgContext } from "@/lib/auth"
import { renderDocumentHtml, type PrintableDocument } from "@/lib/documents/printable"

/**
 * GET /quotes/{id}/pdf
 * Org-scoped printable Quotation. Returns self-contained HTML the browser prints
 * to PDF (no binary PDF dependency). Quotes carry a valid-until date, no due date.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const ctx = await requireOrgContext()
  const supabase = await createClient()

  const [quoteRes, itemsRes] = await Promise.all([
    supabase
      .from("quotes")
      .select(
        "number, status, issue_date, valid_until, subtotal_paise, discount_paise, total_paise, notes, clients(name)"
      )
      .eq("id", id)
      .eq("org_id", ctx.orgId)
      .maybeSingle(),
    supabase
      .from("quote_items")
      .select("description, quantity, unit_price_paise, amount_paise, position")
      .eq("quote_id", id)
      .eq("org_id", ctx.orgId)
      .order("position", { ascending: true }),
  ])

  const quote = quoteRes.data
  if (!quote) notFound()

  const doc: PrintableDocument = {
    kind: "Quotation",
    number: quote.number,
    status: quote.status,
    orgName: ctx.orgName,
    clientName: quote.clients?.name ?? "—",
    issueDate: quote.issue_date,
    dueDate: undefined,
    validUntil: quote.valid_until,
    items: (itemsRes.data ?? []).map((it) => ({
      description: it.description,
      quantity: it.quantity,
      unit_price_paise: it.unit_price_paise,
      amount_paise: it.amount_paise,
    })),
    subtotalPaise: quote.subtotal_paise,
    discountPaise: quote.discount_paise,
    totalPaise: quote.total_paise,
    notes: quote.notes,
  }

  return new Response(renderDocumentHtml(doc), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  })
}
