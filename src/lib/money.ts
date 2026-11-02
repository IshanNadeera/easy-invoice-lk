/**
 * Decimal-safe money and quantity helpers.
 *
 * All amounts are held as BigInt integers in "minor units":
 *  - money:      2 decimal places  (Rs. 12.50  -> 1250n cents)
 *  - quantity:   3 decimal places  (1.5 units  -> 1500n thousandths)
 *  - percentage: 2 decimal places  (12.5 %     -> 1250n basis points)
 *
 * BigInt avoids floating-point error and cannot overflow, so very large
 * invoices stay exact. Values only become strings at the display edge.
 */

export const MONEY_SCALE = 2;
export const QUANTITY_SCALE = 3;
export const PERCENT_SCALE = 2;

const PLAIN_DECIMAL = /^(?:\d+(?:\.\d*)?|\.\d+)$/;
const GROUPED_DECIMAL = /^\d{1,3}(?:,\d{3})+(?:\.\d*)?$/;

/**
 * Parses a user-entered, non-negative decimal string into scaled integer units.
 *
 * Accepts "1250", "1250.5", "1,250.50" and ".5". Rejects negatives, signs,
 * exponents, malformed thousands separators and more decimal places than
 * `scale` (we refuse rather than silently round what the user typed).
 *
 * Returns `null` when the input is empty or invalid.
 */
export function parseDecimal(input: string, scale: number): bigint | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;

  let normalised: string;
  if (PLAIN_DECIMAL.test(trimmed)) {
    normalised = trimmed;
  } else if (GROUPED_DECIMAL.test(trimmed)) {
    normalised = trimmed.replace(/,/g, '');
  } else {
    return null;
  }

  const [intPart = '', fracPart = ''] = normalised.split('.');
  if (fracPart.length > scale) return null;

  const digits = (intPart === '' ? '0' : intPart) + fracPart.padEnd(scale, '0');
  return BigInt(digits);
}

/** Integer division rounding half away from zero. `divisor` must be positive. */
export function divideRoundHalfUp(value: bigint, divisor: bigint): bigint {
  if (divisor <= 0n) throw new RangeError('divisor must be positive');
  if (value < 0n) return -divideRoundHalfUp(-value, divisor);
  return (value * 2n + divisor) / (divisor * 2n);
}

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Formats scaled integer units as a grouped decimal string, e.g. 2500000n -> "25,000.00". */
export function formatScaled(value: bigint, scale: number): string {
  const negative = value < 0n;
  const abs = (negative ? -value : value).toString().padStart(scale + 1, '0');
  const intPart = abs.slice(0, abs.length - scale);
  const fracPart = scale > 0 ? abs.slice(abs.length - scale) : '';
  const body = groupThousands(intPart) + (scale > 0 ? `.${fracPart}` : '');
  return negative ? `-${body}` : body;
}

/** "Rs. 25,000.00" */
export function formatLKR(cents: bigint): string {
  if (cents < 0n) return `-Rs. ${formatScaled(-cents, MONEY_SCALE)}`;
  return `Rs. ${formatScaled(cents, MONEY_SCALE)}`;
}

/** Formats a scaled value without trailing zero decimals: 1500n (scale 3) -> "1.5", 2000n -> "2". */
export function formatTrimmed(value: bigint, scale: number): string {
  const full = formatScaled(value, scale);
  if (scale === 0) return full;
  return full.replace(/\.?0+$/, '');
}

export function formatQuantity(milli: bigint): string {
  return formatTrimmed(milli, QUANTITY_SCALE);
}

export function formatPercent(basisPoints: bigint): string {
  return `${formatTrimmed(basisPoints, PERCENT_SCALE)}%`;
}
