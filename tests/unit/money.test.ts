import { describe, expect, it } from 'vitest';
import {
  divideRoundHalfUp,
  formatLKR,
  formatPercent,
  formatQuantity,
  formatScaled,
  parseDecimal,
} from '../../src/lib/money';

describe('parseDecimal', () => {
  it.each([
    ['1250', 2, 125000n],
    ['1250.5', 2, 125050n],
    ['1,250.50', 2, 125050n],
    ['1,234,567.8', 2, 123456780n],
    ['.5', 2, 50n],
    ['1.', 2, 100n],
    ['0', 2, 0n],
    ['  42  ', 2, 4200n],
    ['1.5', 3, 1500n],
    ['0.001', 3, 1n],
  ])('parses %s (scale %i)', (input, scale, expected) => {
    expect(parseDecimal(input, scale)).toBe(expected);
  });

  it.each(['', '   ', '-1', '+1', '1e3', 'abc', '1,25', '12,3456', '1.2.3', 'Rs. 100'])('rejects %j', (input) => {
    expect(parseDecimal(input, 2)).toBeNull();
  });

  it('rejects more decimal places than the scale instead of rounding', () => {
    expect(parseDecimal('12.345', 2)).toBeNull();
    expect(parseDecimal('1.0001', 3)).toBeNull();
  });
});

describe('divideRoundHalfUp', () => {
  it('rounds half away from zero', () => {
    expect(divideRoundHalfUp(5n, 10n)).toBe(1n);
    expect(divideRoundHalfUp(4n, 10n)).toBe(0n);
    expect(divideRoundHalfUp(15n, 10n)).toBe(2n);
    expect(divideRoundHalfUp(-5n, 10n)).toBe(-1n);
  });

  it('rejects a non-positive divisor', () => {
    expect(() => divideRoundHalfUp(1n, 0n)).toThrow(RangeError);
  });
});

describe('formatting', () => {
  it('formats LKR with grouping and two decimals', () => {
    expect(formatLKR(2500000n)).toBe('Rs. 25,000.00');
    expect(formatLKR(0n)).toBe('Rs. 0.00');
    expect(formatLKR(5n)).toBe('Rs. 0.05');
    expect(formatLKR(123456789012n)).toBe('Rs. 1,234,567,890.12');
    expect(formatLKR(-150n)).toBe('-Rs. 1.50');
  });

  it('formats scaled values', () => {
    expect(formatScaled(100n, 2)).toBe('1.00');
    expect(formatScaled(1234n, 0)).toBe('1,234');
  });

  it('trims trailing zeros for quantities and percentages', () => {
    expect(formatQuantity(1500n)).toBe('1.5');
    expect(formatQuantity(2000n)).toBe('2');
    expect(formatQuantity(1n)).toBe('0.001');
    expect(formatQuantity(1234567000n)).toBe('1,234,567');
    expect(formatPercent(1250n)).toBe('12.5%');
    expect(formatPercent(1000n)).toBe('10%');
  });
});
