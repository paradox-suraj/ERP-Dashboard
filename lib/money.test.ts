import { describe, it, expect } from "vitest"

import {
  rupeeToPaise,
  paiseToRupee,
  sumPaise,
  formatINR,
  formatINRWhole,
  formatINRCompact,
} from "@/lib/money"

describe("money conversions", () => {
  it("converts rupee to integer paise", () => {
    expect(rupeeToPaise(123.45)).toBe(12345)
    expect(rupeeToPaise(1)).toBe(100)
    expect(rupeeToPaise(0)).toBe(0)
  })

  it("rounds fractional paise to the nearest integer", () => {
    expect(rupeeToPaise(0.005)).toBe(1)
    expect(rupeeToPaise(10.999)).toBe(1100)
  })

  it("converts paise back to rupee", () => {
    expect(paiseToRupee(12345)).toBeCloseTo(123.45, 5)
  })

  it("sums paise exactly with no float drift", () => {
    expect(sumPaise([100, 250, 50])).toBe(400)
    expect(sumPaise([])).toBe(0)
    // 0.1 + 0.2 rupee problem does not exist in paise space:
    expect(sumPaise([10, 20])).toBe(30)
  })
})

describe("INR formatting", () => {
  it("formats with two decimals", () => {
    expect(formatINR(123456)).toContain("1,234.56")
  })

  it("formats whole rupee (no decimals)", () => {
    expect(formatINRWhole(123456)).toContain("1,235")
  })

  it("returns a string for compact formatting", () => {
    expect(typeof formatINRCompact(1_234_567_890)).toBe("string")
  })
})
