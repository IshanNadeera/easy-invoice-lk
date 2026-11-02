/**
 * Builds the display-ready invoice model shared by the HTML preview and the PDF.
 * Both renderers consume the same strings, so their numbers can never disagree.
 */
import { calculateInvoice, toCalculationInput } from './calculations';
import { formatDisplayDate } from './dates';
import { formatLKR, formatPercent, formatQuantity, MONEY_SCALE, parseDecimal, PERCENT_SCALE, QUANTITY_SCALE } from './money';
import type { InvoiceFormValues } from './validation';

export interface InvoiceViewItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
}

export interface InvoiceView {
  business: { name: string; address: string; phone: string; email: string; website: string };
  customer: { name: string; address: string; phone: string; email: string };
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: 'LKR';
  items: InvoiceViewItem[];
  subtotal: string;
  hasDiscount: boolean;
  discountLabel: string;
  discountAmount: string;
  total: string;
  paymentInstructions: string;
  notes: string;
  footerMessage: string;
}

const EMPTY = '—';

export function buildInvoiceView(values: InvoiceFormValues): InvoiceView {
  const calc = calculateInvoice(toCalculationInput(values));

  const items = values.items.map((item, index) => {
    const quantity = parseDecimal(item.quantity, QUANTITY_SCALE);
    const unitPrice = parseDecimal(item.unitPrice, MONEY_SCALE);
    return {
      id: item.id,
      description: item.description.trim(),
      quantity: quantity === null ? EMPTY : formatQuantity(quantity),
      unitPrice: unitPrice === null ? EMPTY : formatLKR(unitPrice),
      lineTotal: formatLKR(calc.lineTotals[index] ?? 0n),
    };
  });

  let discountLabel = 'Discount';
  if (values.discountType === 'percentage') {
    const percent = parseDecimal(values.discountValue, PERCENT_SCALE);
    if (percent !== null && percent > 0n) discountLabel = `Discount (${formatPercent(percent)})`;
  }

  return {
    business: {
      name: values.business.name.trim(),
      address: values.business.address.trim(),
      phone: values.business.phone.trim(),
      email: values.business.email.trim(),
      website: values.business.website.trim(),
    },
    customer: {
      name: values.customer.name.trim(),
      address: values.customer.address.trim(),
      phone: values.customer.phone.trim(),
      email: values.customer.email.trim(),
    },
    invoiceNumber: values.invoiceNumber.trim(),
    invoiceDate: formatDisplayDate(values.invoiceDate),
    dueDate: formatDisplayDate(values.dueDate),
    currency: 'LKR',
    items,
    subtotal: formatLKR(calc.subtotal),
    hasDiscount: calc.discountAmount > 0n,
    discountLabel,
    discountAmount: `- ${formatLKR(calc.discountAmount)}`,
    total: formatLKR(calc.total),
    paymentInstructions: values.paymentInstructions.trim(),
    notes: values.notes.trim(),
    footerMessage: values.footerMessage.trim(),
  };
}

/** Predictable, filesystem-safe PDF name: "INV-0001.pdf". */
export function invoicePdfFileName(invoiceNumber: string): string {
  const safe = invoiceNumber
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 60);
  return `${safe || 'invoice'}.pdf`;
}
