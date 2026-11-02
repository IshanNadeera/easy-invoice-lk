import { describe, expect, it } from 'vitest';
import {
  calculateDiscountAmount,
  calculateInvoice,
  calculateLineTotal,
  toCalculationInput,
  type CalculableValues,
} from '../../src/lib/calculations';

const values = (overrides: Partial<CalculableValues> = {}): CalculableValues => ({
  items: [{ quantity: '1', unitPrice: '100' }],
  discountType: 'fixed',
  discountValue: '',
  ...overrides,
});

describe('calculateLineTotal', () => {
  it('multiplies quantity by unit price', () => {
    expect(calculateLineTotal(2000n, 150000n)).toBe(300000n); // 2 × Rs 1,500
  });

  it('rounds fractional quantities half-up to the cent', () => {
    expect(calculateLineTotal(333n, 1001n)).toBe(333n); // 0.333 × 10.01 = 3.33333
    expect(calculateLineTotal(500n, 1n)).toBe(1n); // 0.5 × 0.01 = 0.005 -> 0.01
  });

  it('allows a zero price (free item)', () => {
    expect(calculateLineTotal(1000n, 0n)).toBe(0n);
  });
});

describe('calculateDiscountAmount', () => {
  it('returns the fixed amount', () => {
    expect(calculateDiscountAmount(100000n, 'fixed', 2500n)).toBe(2500n);
  });

  it('calculates a percentage of the subtotal', () => {
    expect(calculateDiscountAmount(4350000n, 'percentage', 500n)).toBe(217500n); // 5%
    expect(calculateDiscountAmount(1000n, 'percentage', 1250n)).toBe(125n); // 12.5%
  });

  it('rounds percentage discounts half-up', () => {
    expect(calculateDiscountAmount(333n, 'percentage', 5000n)).toBe(167n); // 50% of 3.33 = 1.665 -> 1.67
  });

  it('is zero when value is zero', () => {
    expect(calculateDiscountAmount(1000n, 'percentage', 0n)).toBe(0n);
    expect(calculateDiscountAmount(1000n, 'fixed', 0n)).toBe(0n);
  });
});

describe('calculateInvoice', () => {
  it('sums rounded line totals into the subtotal', () => {
    const result = calculateInvoice(
      toCalculationInput(
        values({
          items: [
            { quantity: '1', unitPrice: '25000' },
            { quantity: '8', unitPrice: '1500' },
            { quantity: '2', unitPrice: '3250' },
          ],
          discountType: 'percentage',
          discountValue: '5',
        }),
      ),
    );
    expect(result.lineTotals).toEqual([2500000n, 1200000n, 650000n]);
    expect(result.subtotal).toBe(4350000n);
    expect(result.discountAmount).toBe(217500n);
    expect(result.total).toBe(4132500n);
  });

  it('never returns a negative total', () => {
    const result = calculateInvoice(toCalculationInput(values({ discountValue: '999999' })));
    expect(result.total).toBe(0n);
  });

  it('handles 100% discount', () => {
    const result = calculateInvoice(toCalculationInput(values({ discountType: 'percentage', discountValue: '100' })));
    expect(result.total).toBe(0n);
  });

  it('avoids floating-point drift (0.1 + 0.2)', () => {
    const result = calculateInvoice(
      toCalculationInput(values({ items: [{ quantity: '1', unitPrice: '0.10' }, { quantity: '1', unitPrice: '0.20' }] })),
    );
    expect(result.subtotal).toBe(30n);
  });

  it('stays exact for very large totals', () => {
    const result = calculateInvoice(
      toCalculationInput(values({ items: [{ quantity: '1000000', unitPrice: '1000000000' }] })),
    );
    expect(result.total).toBe(100_000_000_000_000_000n);
  });

  it('treats unparseable input as zero for the live preview', () => {
    const result = calculateInvoice(toCalculationInput(values({ items: [{ quantity: 'abc', unitPrice: '10' }] })));
    expect(result.subtotal).toBe(0n);
  });
});
