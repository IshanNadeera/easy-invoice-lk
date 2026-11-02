import { todayISO } from './dates';
import type { InvoiceFormValues, InvoiceItemValues } from './validation';

export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyItem(): InvoiceItemValues {
  return { id: newId(), description: '', quantity: '1', unitPrice: '' };
}

export function createDefaultValues(now: Date = new Date()): InvoiceFormValues {
  return {
    business: { name: '', address: '', phone: '', email: '', website: '' },
    customer: { name: '', address: '', phone: '', email: '' },
    invoiceNumber: 'INV-0001',
    invoiceDate: todayISO(now),
    dueDate: '',
    items: [createEmptyItem()],
    discountType: 'fixed',
    discountValue: '',
    paymentInstructions: '',
    notes: '',
    footerMessage: 'Thank you for your business.',
  };
}

/** Realistic sample used on the landing page preview. */
export const SAMPLE_INVOICE: InvoiceFormValues = {
  business: {
    name: 'Lanka Creative Studio',
    address: '42 Galle Road, Colombo 03',
    phone: '077 123 4567',
    email: 'hello@lankacreative.example',
    website: '',
  },
  customer: {
    name: 'Ceylon Tea Traders (Pvt) Ltd',
    address: '15 Kandy Road, Kadawatha',
    phone: '071 987 6543',
    email: '',
  },
  invoiceNumber: 'INV-0042',
  invoiceDate: '2026-11-02',
  dueDate: '2026-11-16',
  items: [
    { id: 's1', description: 'Logo design — 3 concepts and 2 revisions', quantity: '1', unitPrice: '25000' },
    { id: 's2', description: 'Social media post designs', quantity: '8', unitPrice: '1500' },
    { id: 's3', description: 'Printed business cards (box of 100)', quantity: '2', unitPrice: '3250' },
  ],
  discountType: 'percentage',
  discountValue: '5',
  paymentInstructions: 'Bank transfer to Commercial Bank, A/C 1234567890, Lanka Creative Studio.',
  notes: '',
  footerMessage: 'Thank you for your business.',
};
