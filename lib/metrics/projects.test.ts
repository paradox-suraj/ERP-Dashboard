import { describe, it, expect } from "vitest"

import {
  projectProfit,
  type InvoiceForProfit,
  type CostForProfit,
} from "@/lib/metrics/projects"

describe("projectProfit", () => {
  const invoices: InvoiceForProfit[] = [
    { status: "paid", amount_paise: 500_000 },
    { status: "sent", amount_paise: 300_000 },
    { status: "draft", amount_paise: 100_000 },
    { status: "cancelled", amount_paise: 200_000 },
  ]
  const costs: CostForProfit[] = [
    { amount_paise: 200_000 },
    { amount_paise: 100_000 },
  ]

  it("computes revenue, cost, profit, and margin", () => {
    const r = projectProfit(invoices, costs)
    expect(r.revenuePaise).toBe(800_000) // paid + sent (draft/cancelled excluded)
    expect(r.costPaise).toBe(300_000)
    expect(r.profitPaise).toBe(500_000)
    expect(r.marginPct).toBeCloseTo(62.5, 5)
  })

  it("handles zero revenue without dividing by zero", () => {
    const r = projectProfit([], [{ amount_paise: 50_000 }])
    expect(r.revenuePaise).toBe(0)
    expect(r.costPaise).toBe(50_000)
    expect(r.profitPaise).toBe(-50_000)
    expect(r.marginPct).toBe(0)
  })
})
