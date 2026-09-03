import { describe, it, expect } from "vitest"

import {
  lineAmountPaise,
  withLineAmount,
  subtotalPaise,
  documentTotalPaise,
} from "./line-items"

describe("lineAmountPaise", () => {
  it("multiplies quantity by unit price", () => {
    expect(lineAmountPaise(2, 50000)).toBe(100000)
  })

  it("rounds fractional quantities to the nearest paise", () => {
    // 1.5 h × ₹333.33 = ₹499.995 → 49999.5 paise → 50000
    expect(lineAmountPaise(1.5, 33333)).toBe(50000)
  })

  it("returns 0 for non-finite input", () => {
    expect(lineAmountPaise(NaN, 1000)).toBe(0)
    expect(lineAmountPaise(1, Infinity)).toBe(0)
  })
})

describe("withLineAmount", () => {
  it("attaches the computed amount", () => {
    expect(withLineAmount({ quantity: 3, unit_price_paise: 10000 })).toEqual({
      quantity: 3,
      unit_price_paise: 10000,
      amount_paise: 30000,
    })
  })
})

describe("subtotalPaise", () => {
  it("sums raw inputs", () => {
    expect(
      subtotalPaise([
        { quantity: 2, unit_price_paise: 10000 },
        { quantity: 1, unit_price_paise: 5000 },
      ])
    ).toBe(25000)
  })

  it("prefers a precomputed amount_paise when present", () => {
    expect(subtotalPaise([{ amount_paise: 12345 }, { amount_paise: 55 }])).toBe(
      12400
    )
  })

  it("is 0 for an empty document", () => {
    expect(subtotalPaise([])).toBe(0)
  })
})

describe("documentTotalPaise", () => {
  it("subtracts the discount", () => {
    expect(documentTotalPaise(100000, 15000)).toBe(85000)
  })

  it("floors at 0 when discount exceeds subtotal", () => {
    expect(documentTotalPaise(10000, 25000)).toBe(0)
  })

  it("ignores a negative discount", () => {
    expect(documentTotalPaise(10000, -5000)).toBe(10000)
  })

  it("defaults discount to 0", () => {
    expect(documentTotalPaise(10000)).toBe(10000)
  })
})
