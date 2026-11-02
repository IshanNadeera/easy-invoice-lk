/**
 * The single source of truth for invoice arithmetic.
 * The form, live preview, validation and PDF all go through this module.
 *
 * Rounding rules (documented in README):
 *  1. Each line total is rounded half-up to the cent.
 *  2. Subtotal is the sum of the rounded line totals, so the printed
 *     lines always add up to the printed subtotal.
 *  3. A percentage discount is rounded half-up to the cent.
 *  4. Grand total = max(0, subtotal - discount). Tax is out of MVP scope.
 */
import { divideRoundHalfUp, MONEY_SCALE, parseDecimal, PERCENT_SCALE, QUANTITY_SCALE } from './money';

export type DiscountType = 'fixed' | 'percentage';

export const MAX_ITEMS = 100;
/** 1,000,000 units */
export const MAX_QUANTITY_MILLI = 1_000_000_000n;
/** Rs. 1,000,000,000.00 */
export const MAX_UNIT_PRICE_CENTS = 100_000_000_000n;
/** 100.00 % */
export const MAX_PERCENT_BASIS_POINTS = 10_000n;

const QUANTITY_DIVISOR = 10n ** BigInt(QUANTITY_SCALE);
const PERCENT_DIVISOR = 100n * 10n ** BigInt(PERCENT_SCALE);

export interface CalculationItem {
  quantityMilli: bigint;
  unitPriceCents: bigint;
}

export interface CalculationInput {
  items: readonly CalculationItem[];
  discount: {
    type: DiscountType;
    /** Cents for a fixed discount, basis points (1% = 100) for a percentage. */
    value: bigint;
  };
}

export interface CalculationResult {
  lineTotals: bigint[];
  subtotal: bigint;
  discountAmount: bigint;
  total: bigint;
}

export function calculateLineTotal(quantityMilli: bigint, unitPriceCents: bigint): bigint {
  return divideRoundHalfUp(quantityMilli * unitPriceCents, QUANTITY_DIVISOR);
}

export function calculateDiscountAmount(subtotal: bigint, type: DiscountType, value: bigint): bigint {
  if (value <= 0n) return 0n;
  if (type === 'fixed') return value;
  return divideRoundHalfUp(subtotal * value, PERCENT_DIVISOR);
}

export function calculateInvoice(input: CalculationInput): CalculationResult {
  const lineTotals = input.items.map((item) => calculateLineTotal(item.quantityMilli, item.unitPriceCents));
  const subtotal = lineTotals.reduce((sum, line) => sum + line, 0n);
  const discountAmount = calculateDiscountAmount(subtotal, input.discount.type, input.discount.value);
  const total = subtotal - discountAmount > 0n ? subtotal - discountAmount : 0n;
  return { lineTotals, subtotal, discountAmount, total };
}

/** Minimal shape of the form values needed for calculation (kept structural to avoid import cycles). */
export interface CalculableValues {
  items: readonly { quantity: string; unitPrice: string }[];
  discountType: DiscountType;
  discountValue: string;
}

/**
 * Converts raw form strings to calculation input. Lenient: anything that does
 * not parse counts as zero, so the live preview keeps working while the user
 * is still typing. Validation reports the actual errors separately.
 */
export function toCalculationInput(values: CalculableValues): CalculationInput {
  const discountScale = values.discountType === 'fixed' ? MONEY_SCALE : PERCENT_SCALE;
  return {
    items: values.items.map((item) => ({
      quantityMilli: parseDecimal(item.quantity, QUANTITY_SCALE) ?? 0n,
      unitPriceCents: parseDecimal(item.unitPrice, MONEY_SCALE) ?? 0n,
    })),
    discount: {
      type: values.discountType,
      value: parseDecimal(values.discountValue, discountScale) ?? 0n,
    },
  };
}
