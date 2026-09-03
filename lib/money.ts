/**
 * Money is stored EVERYWHERE as integer minor units (paise). 100 paise = 1 INR.
 *
 * Rules:
 *  - Never store or compute money as a float. Columns are `bigint` paise.
 *  - Convert rupee <-> paise only at the edges (form input / display).
 *  - Every module imports these helpers; do not hand-roll paise <-> rupee.
 */

/** Integer paise. e.g. 12345 === ₹123.45 */
export type Paise = number

export const PAISE_PER_RUPEE = 100

/** Convert a rupee amount (possibly fractional user input) to integer paise. */
export function rupeeToPaise(rupee: number): Paise {
  return Math.round(rupee * PAISE_PER_RUPEE)
}

/** Convert integer paise to a rupee number. For display/aggregation only. */
export function paiseToRupee(paise: Paise): number {
  return paise / PAISE_PER_RUPEE
}

/** Safe integer sum of paise amounts. */
export function sumPaise(amounts: Paise[]): Paise {
  return amounts.reduce((acc, n) => acc + n, 0)
}

const inrFull = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const inrWhole = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const inrCompact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
})

/** Format integer paise as Indian Rupee: 123456 -> "₹1,234.56". */
export function formatINR(paise: Paise): string {
  return inrFull.format(paiseToRupee(paise))
}

/** Format integer paise with no decimals: 123456 -> "₹1,235". */
export function formatINRWhole(paise: Paise): string {
  return inrWhole.format(paiseToRupee(paise))
}

/** Compact format for dashboard cards: 1234567890 -> "₹12.3M". */
export function formatINRCompact(paise: Paise): string {
  return inrCompact.format(paiseToRupee(paise))
}
