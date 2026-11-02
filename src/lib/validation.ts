import { z } from 'zod';
import {
  calculateInvoice,
  MAX_ITEMS,
  MAX_PERCENT_BASIS_POINTS,
  MAX_QUANTITY_MILLI,
  MAX_UNIT_PRICE_CENTS,
  toCalculationInput,
} from './calculations';
import { isValidISODate } from './dates';
import { MONEY_SCALE, parseDecimal, PERCENT_SCALE, QUANTITY_SCALE } from './money';

// Deliberately simple: catches typos without rejecting unusual but valid addresses.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or fewer`);

const optionalText = (label: string, max: number) =>
  z.string().trim().max(max, `${label} must be ${max} characters or fewer`);

const optionalEmail = z
  .string()
  .trim()
  .max(254, 'Email must be 254 characters or fewer')
  .refine((value) => value === '' || EMAIL_PATTERN.test(value), 'Enter a valid email address, e.g. name@example.com');

const quantityField = z.string().superRefine((value, ctx) => {
  if (value.trim() === '') {
    ctx.addIssue({ code: 'custom', message: 'Enter a quantity' });
    return;
  }
  const parsed = parseDecimal(value, QUANTITY_SCALE);
  if (parsed === null) {
    ctx.addIssue({ code: 'custom', message: 'Quantity must be a positive number (up to 3 decimals)' });
  } else if (parsed === 0n) {
    ctx.addIssue({ code: 'custom', message: 'Quantity must be greater than 0' });
  } else if (parsed > MAX_QUANTITY_MILLI) {
    ctx.addIssue({ code: 'custom', message: 'Quantity is too large' });
  }
});

const unitPriceField = z.string().superRefine((value, ctx) => {
  if (value.trim() === '') {
    ctx.addIssue({ code: 'custom', message: 'Enter a unit price (0 is allowed)' });
    return;
  }
  const parsed = parseDecimal(value, MONEY_SCALE);
  if (parsed === null) {
    ctx.addIssue({ code: 'custom', message: 'Price must be a number of 0 or more (up to 2 decimals)' });
  } else if (parsed > MAX_UNIT_PRICE_CENTS) {
    ctx.addIssue({ code: 'custom', message: 'Price is too large' });
  }
});

export const invoiceItemSchema = z.object({
  id: z.string(),
  description: requiredText('Item description', 500),
  quantity: quantityField,
  unitPrice: unitPriceField,
});

export const invoiceSchema = z
  .object({
    business: z.object({
      name: requiredText('Business name', 120),
      address: optionalText('Address', 300),
      phone: optionalText('Phone', 40),
      email: optionalEmail,
      website: optionalText('Website', 120),
    }),
    customer: z.object({
      name: requiredText('Customer name', 120),
      address: optionalText('Address', 300),
      phone: optionalText('Phone', 40),
      email: optionalEmail,
    }),
    invoiceNumber: requiredText('Invoice number', 40),
    invoiceDate: z.string().refine(isValidISODate, 'Enter a valid invoice date'),
    dueDate: z.string().refine((value) => value === '' || isValidISODate(value), 'Enter a valid due date'),
    items: z
      .array(invoiceItemSchema)
      .min(1, 'Add at least one item')
      .max(MAX_ITEMS, `An invoice can have up to ${MAX_ITEMS} items`),
    discountType: z.enum(['fixed', 'percentage']),
    discountValue: z.string(),
    paymentInstructions: optionalText('Payment instructions', 1000),
    notes: optionalText('Notes', 1000),
    footerMessage: optionalText('Thank-you message', 200),
  })
  .superRefine((values, ctx) => {
    // ISO dates compare correctly as strings.
    if (values.dueDate !== '' && isValidISODate(values.dueDate) && isValidISODate(values.invoiceDate)) {
      if (values.dueDate < values.invoiceDate) {
        ctx.addIssue({ code: 'custom', path: ['dueDate'], message: 'Due date cannot be before the invoice date' });
      }
    }

    const discountRaw = values.discountValue.trim();
    if (discountRaw === '') return;

    const scale = values.discountType === 'fixed' ? MONEY_SCALE : PERCENT_SCALE;
    const discount = parseDecimal(discountRaw, scale);
    if (discount === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['discountValue'],
        message: 'Discount must be a number of 0 or more (up to 2 decimals)',
      });
      return;
    }

    if (values.discountType === 'percentage') {
      if (discount > MAX_PERCENT_BASIS_POINTS) {
        ctx.addIssue({ code: 'custom', path: ['discountValue'], message: 'Percentage must be between 0 and 100' });
      }
      return;
    }

    const { subtotal } = calculateInvoice(toCalculationInput(values));
    if (discount > subtotal) {
      ctx.addIssue({ code: 'custom', path: ['discountValue'], message: 'Discount cannot be more than the subtotal' });
    }
  });

export type InvoiceFormValues = z.input<typeof invoiceSchema>;
export type InvoiceItemValues = InvoiceFormValues['items'][number];
