import { describe, it, expect } from "vitest"

import {
  totalMinutes,
  minutesToHours,
  entryValuePaise,
  billableValuePaise,
  minutesByProject,
  utilization,
} from "./timesheets"

const entry = (
  project_id: string,
  minutes: number,
  billable = true,
  rate_paise: number | null = 100000 // ₹1,000 / hour
) => ({ project_id, minutes, billable, rate_paise })

describe("totalMinutes", () => {
  it("sums minutes", () => {
    expect(totalMinutes([{ minutes: 60 }, { minutes: 30 }])).toBe(90)
  })
})

describe("minutesToHours", () => {
  it("converts minutes to decimal hours", () => {
    expect(minutesToHours(90)).toBe(1.5)
  })
})

describe("entryValuePaise", () => {
  it("is hours × rate for billable entries", () => {
    // 90 min = 1.5 h × ₹1,000 = ₹1,500 = 150000 paise
    expect(entryValuePaise(entry("p1", 90))).toBe(150000)
  })

  it("is 0 for non-billable entries", () => {
    expect(entryValuePaise(entry("p1", 90, false))).toBe(0)
  })

  it("is 0 when rate is null", () => {
    expect(entryValuePaise(entry("p1", 90, true, null))).toBe(0)
  })
})

describe("billableValuePaise", () => {
  it("sums billable value only", () => {
    expect(
      billableValuePaise([
        entry("p1", 60), // ₹1,000
        entry("p1", 60, false), // excluded
        entry("p2", 30), // ₹500
      ])
    ).toBe(150000)
  })
})

describe("minutesByProject", () => {
  it("groups minutes by project", () => {
    expect(
      minutesByProject([
        { project_id: "p1", minutes: 60 },
        { project_id: "p1", minutes: 30 },
        { project_id: "p2", minutes: 45 },
      ])
    ).toEqual({ p1: 90, p2: 45 })
  })
})

describe("utilization", () => {
  it("is billable ÷ total", () => {
    expect(
      utilization([
        { minutes: 60, billable: true },
        { minutes: 60, billable: false },
      ])
    ).toBe(0.5)
  })

  it("is 0 with no logged time", () => {
    expect(utilization([])).toBe(0)
  })
})
