import { describe, expect, it } from 'vitest';
import { createDefaultValues, SAMPLE_INVOICE } from '../../src/lib/defaults';
import { invoiceSchema, type InvoiceFormValues } from '../../src/lib/validation';

function validInvoice(overrides: Partial<InvoiceFormValues> = {}): InvoiceFormValues {
  return { ...structuredClone(SAMPLE_INVOICE), ...overrides };
}

function errorsFor(values: InvoiceFormValues): Record<string, string> {
  const result = invoiceSchema.safeParse(values);
  if (result.success) return {};
  const out: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.');
    out[key] ??= issue.message;
  }
  return out;
}

describe('invoiceSchema', () => {
  it('accepts a complete invoice', () => {
    expect(errorsFor(validInvoice())).toEqual({});
  });

  it('requires business name, customer name, invoice number and item description', () => {
    const errors = errorsFor(createDefaultValues(new Date(2026, 10, 2)));
    expect(errors['business.name']).toBe('Business name is required');
    expect(errors['customer.name']).toBe('Customer name is required');
    expect(errors['items.0.description']).toBe('Item description is required');
    expect(errors['items.0.unitPrice']).toMatch(/unit price/i);
  });

  it('treats whitespace-only text as empty', () => {
    const v = validInvoice();
    v.business.name = '   ';
    expect(errorsFor(v)['business.name']).toBe('Business name is required');
  });

  it('requires at least one item', () => {
    expect(errorsFor(validInvoice({ items: [] }))['items']).toBe('Add at least one item');
  });

  it.each([
    ['0', 'Quantity must be greater than 0'],
    ['-1', 'Quantity must be a positive number (up to 3 decimals)'],
    ['abc', 'Quantity must be a positive number (up to 3 decimals)'],
    ['', 'Enter a quantity'],
  ])('rejects quantity %j', (quantity, message) => {
    const v = validInvoice();
    v.items[0]!.quantity = quantity;
    expect(errorsFor(v)['items.0.quantity']).toBe(message);
  });

  it('rejects a negative price but allows zero', () => {
    const v = validInvoice();
    v.items[0]!.unitPrice = '-5';
    expect(errorsFor(v)['items.0.unitPrice']).toBeDefined();
    v.items[0]!.unitPrice = '0';
    expect(errorsFor(v)['items.0.unitPrice']).toBeUndefined();
  });

  it('rejects a percentage above 100', () => {
    expect(errorsFor(validInvoice({ discountType: 'percentage', discountValue: '100.01' }))['discountValue']).toBe(
      'Percentage must be between 0 and 100',
    );
    expect(errorsFor(validInvoice({ discountType: 'percentage', discountValue: '100' }))['discountValue']).toBeUndefined();
  });

  it('rejects a fixed discount larger than the subtotal', () => {
    // Sample subtotal is Rs. 43,500.00
    expect(errorsFor(validInvoice({ discountType: 'fixed', discountValue: '43500.01' }))['discountValue']).toBe(
      'Discount cannot be more than the subtotal',
    );
    expect(errorsFor(validInvoice({ discountType: 'fixed', discountValue: '43500' }))['discountValue']).toBeUndefined();
  });

  it('rejects a negative discount', () => {
    expect(errorsFor(validInvoice({ discountValue: '-10' }))['discountValue']).toBeDefined();
  });

  it('rejects a due date before the invoice date', () => {
    expect(errorsFor(validInvoice({ invoiceDate: '2026-11-10', dueDate: '2026-11-09' }))['dueDate']).toBe(
      'Due date cannot be before the invoice date',
    );
    expect(errorsFor(validInvoice({ invoiceDate: '2026-11-10', dueDate: '' }))['dueDate']).toBeUndefined();
  });

  it('validates optional email only when provided', () => {
    const v = validInvoice();
    v.customer.email = 'not-an-email';
    expect(errorsFor(v)['customer.email']).toMatch(/valid email/);
    v.customer.email = '';
    expect(errorsFor(v)['customer.email']).toBeUndefined();
  });

  it('trims text in the parsed output', () => {
    const v = validInvoice();
    v.business.name = '  Lanka Studio  ';
    const parsed = invoiceSchema.parse(v);
    expect(parsed.business.name).toBe('Lanka Studio');
  });
});
