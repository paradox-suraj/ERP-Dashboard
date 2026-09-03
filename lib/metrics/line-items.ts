import { sumPaise, type Paise } from "@/lib/money"

/**
 * Line-item math shared by quotes and invoices. Money stays integer paise;
 * quantity may be fractional (e.g. 1.5 hours), so the line amount is rounded to
 * the nearest paise exactly once, here, at computation time.
 */

export type LineItemInput = {
  quantity: number
  unit_price_paise: Paise
}

export type LineItemAmount = { amount_paise: Paise }

/** amount = round(quantity × unit price). Never a float in storage. */
export function lineAmountPaise(
  quantity: number,
  unitPricePaise: Paise
): Paise {
  if (!Number.isFinite(quantity) || !Number.isFinite(unitPricePaise)) return 0
  return Math.round(quantity * unitPricePaise)
}

/** Attach the computed amount to a raw line input. */
export function withLineAmount<T extends LineItemInput>(
  item: T
): T & LineItemAmount {
  return { ...item, amount_paise: lineAmountPaise(item.quantity, item.unit_price_paise) }
}

/** Subtotal = Σ line amounts. Accepts either raw inputs or rows carrying amount_paise. */
export function subtotalPaise(
  items: Array<LineItemInput | LineItemAmount>
): Paise {
  return sumPaise(
    items.map((i) =>
      "amount_paise" in i
        ? i.amount_paise
        : lineAmountPaise(i.quantity, i.unit_price_paise)
    )
  )
}

/**
 * Document total = subtotal − discount, floored at 0. Discount is an absolute
 * paise amount (not a percentage), matching the quotes.discount_paise column.
 */
export function documentTotalPaise(
  subtotal: Paise,
  discountPaise: Paise = 0
): Paise {
  return Math.max(0, subtotal - Math.max(0, discountPaise))
}
