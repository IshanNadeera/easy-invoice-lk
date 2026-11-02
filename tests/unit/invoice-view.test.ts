import { describe, expect, it } from 'vitest';
import { formatDisplayDate, isValidISODate, todayISO } from '../../src/lib/dates';
import { SAMPLE_INVOICE } from '../../src/lib/defaults';
import { buildInvoiceView, invoicePdfFileName } from '../../src/lib/invoice-view';

describe('buildInvoiceView', () => {
  it('formats the sample invoice for display', () => {
    const view = buildInvoiceView(SAMPLE_INVOICE);
    expect(view.invoiceDate).toBe('2 Nov 2026');
    expect(view.dueDate).toBe('16 Nov 2026');
    expect(view.items.map((i) => i.lineTotal)).toEqual(['Rs. 25,000.00', 'Rs. 12,000.00', 'Rs. 6,500.00']);
    expect(view.subtotal).toBe('Rs. 43,500.00');
    expect(view.hasDiscount).toBe(true);
    expect(view.discountLabel).toBe('Discount (5%)');
    expect(view.discountAmount).toBe('- Rs. 2,175.00');
    expect(view.total).toBe('Rs. 41,325.00');
  });

  it('shows a dash for quantities and prices that do not parse yet', () => {
    const view = buildInvoiceView({
      ...SAMPLE_INVOICE,
      items: [{ id: 'x', description: 'Thing', quantity: 'abc', unitPrice: '' }],
    });
    expect(view.items[0]).toMatchObject({ quantity: '—', unitPrice: '—', lineTotal: 'Rs. 0.00' });
  });

  it('hides the discount row when there is no discount', () => {
    const view = buildInvoiceView({ ...SAMPLE_INVOICE, discountValue: '' });
    expect(view.hasDiscount).toBe(false);
    expect(view.discountLabel).toBe('Discount');
  });
});

describe('invoicePdfFileName', () => {
  it.each([
    ['INV-0001', 'INV-0001.pdf'],
    ['  INV 0001  ', 'INV-0001.pdf'],
    ['2026/11/001', '2026-11-001.pdf'],
    ['../../etc', 'etc.pdf'],
    ['', 'invoice.pdf'],
    ['###', 'invoice.pdf'],
  ])('%j -> %j', (input, expected) => {
    expect(invoicePdfFileName(input)).toBe(expected);
  });
});

describe('dates', () => {
  it('validates real calendar dates only', () => {
    expect(isValidISODate('2028-02-29')).toBe(true);
    expect(isValidISODate('2026-02-29')).toBe(false);
    expect(isValidISODate('2026-13-01')).toBe(false);
    expect(isValidISODate('')).toBe(false);
  });

  it('formats dates independently of locale', () => {
    expect(formatDisplayDate('2026-11-02')).toBe('2 Nov 2026');
    expect(formatDisplayDate('nope')).toBe('');
  });

  it('uses local time for today', () => {
    expect(todayISO(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});
