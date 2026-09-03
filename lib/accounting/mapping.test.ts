import { describe, it, expect } from "vitest"

import { invoiceToExternalPayload } from "@/lib/accounting/mapping"

/**
 * Pure mapping: our invoice row (+ optional client) -> provider-neutral payload.
 * DB-independent — inputs are plain objects, so these run with no Supabase.
 */
describe("invoiceToExternalPayload", () => {
  const baseInvoice = {
    number: "INV-2026-001",
    amount_paise: 123456, // ₹1,234.56
    status: "sent",
    issue_date: "2026-06-01",
    due_date: "2026-06-30",
  }

  it("converts paise to rupee exactly (divide by 100)", () => {
    const p = invoiceToExternalPayload(baseInvoice, { name: "Acme Co" })
    expect(p.totalRupee).toBe(1234.56)
  })

  it("converts whole-rupee amounts with no fractional drift", () => {
    expect(
      invoiceToExternalPayload({ ...baseInvoice, amount_paise: 100 }, null)
        .totalRupee
    ).toBe(1)
    expect(
      invoiceToExternalPayload({ ...baseInvoice, amount_paise: 0 }, null)
        .totalRupee
    ).toBe(0)
    expect(
      invoiceToExternalPayload(
        { ...baseInvoice, amount_paise: 5000000 },
        null
      ).totalRupee
    ).toBe(50000)
  })

  it("carries the invoice number as the reference", () => {
    const p = invoiceToExternalPayload(baseInvoice, { name: "Acme Co" })
    expect(p.reference).toBe("INV-2026-001")
  })

  it("uses the client name as customerName", () => {
    const p = invoiceToExternalPayload(baseInvoice, { name: "Bright Studio" })
    expect(p.customerName).toBe("Bright Studio")
  })

  it("falls back to 'Unknown' when the client is null or missing", () => {
    expect(invoiceToExternalPayload(baseInvoice, null).customerName).toBe(
      "Unknown"
    )
    expect(invoiceToExternalPayload(baseInvoice).customerName).toBe("Unknown")
  })

  it("falls back to 'Unknown' when the client has an empty name", () => {
    expect(
      invoiceToExternalPayload(baseInvoice, { name: "" }).customerName
    ).toBe("Unknown")
  })

  it("passes issue and due dates through unchanged", () => {
    const p = invoiceToExternalPayload(baseInvoice, null)
    expect(p.issueDate).toBe("2026-06-01")
    expect(p.dueDate).toBe("2026-06-30")
  })

  it("preserves null dates", () => {
    const p = invoiceToExternalPayload(
      { ...baseInvoice, issue_date: null, due_date: null },
      null
    )
    expect(p.issueDate).toBeNull()
    expect(p.dueDate).toBeNull()
  })

  it("carries the invoice status through", () => {
    expect(
      invoiceToExternalPayload({ ...baseInvoice, status: "paid" }, null).status
    ).toBe("paid")
  })

  it("always sets currency to INR", () => {
    expect(invoiceToExternalPayload(baseInvoice, null).currency).toBe("INR")
  })
})
