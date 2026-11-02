import { useId } from 'react';
import { useFormContext } from 'react-hook-form';
import { FieldShell, FormSection, inputClasses, TextAreaField, TextField } from '../../components/forms/fields';
import type { InvoiceView } from '../../lib/invoice-view';
import type { InvoiceFormValues } from '../../lib/validation';
import { LineItemsField } from './LineItemsField';

export function InvoiceForm({ view }: { view: InvoiceView }) {
  return (
    <div className="space-y-4">
      <FormSection title="Your business">
        <TextField name="business.name" label="Business name" required autoComplete="organization" />
        <TextAreaField name="business.address" label="Address" autoComplete="street-address" />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="business.phone" label="Phone" type="tel" inputMode="tel" autoComplete="tel" />
          <TextField name="business.email" label="Email" type="email" inputMode="email" autoComplete="email" />
        </div>
        <TextField name="business.website" label="Website" hint="Optional" inputMode="url" autoComplete="url" />
      </FormSection>

      <FormSection title="Customer">
        <TextField name="customer.name" label="Customer name" required autoComplete="off" />
        <TextAreaField name="customer.address" label="Address" autoComplete="off" />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="customer.phone" label="Phone" type="tel" inputMode="tel" autoComplete="off" />
          <TextField name="customer.email" label="Email" type="email" inputMode="email" autoComplete="off" />
        </div>
      </FormSection>

      <FormSection title="Invoice details">
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField name="invoiceNumber" label="Invoice number" required autoComplete="off" />
          <TextField name="invoiceDate" label="Invoice date" type="date" required />
          <TextField name="dueDate" label="Due date" type="date" hint="Optional" />
        </div>
        <p className="text-xs text-slate-500">Currency: Sri Lankan Rupees (LKR)</p>
      </FormSection>

      <FormSection title="Items">
        <LineItemsField lineTotals={view.items.map((item) => item.lineTotal)} />
      </FormSection>

      <FormSection title="Totals">
        <DiscountField />
        <dl className="space-y-2 border-t border-slate-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">Subtotal</dt>
            <dd className="tabular-nums" data-testid="form-subtotal">
              {view.subtotal}
            </dd>
          </div>
          {view.hasDiscount ? (
            <div className="flex justify-between">
              <dt className="text-slate-600">{view.discountLabel}</dt>
              <dd className="tabular-nums" data-testid="form-discount">
                {view.discountAmount}
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums" data-testid="form-total">
              {view.total}
            </dd>
          </div>
        </dl>
      </FormSection>

      <FormSection title="Notes and payment">
        <TextAreaField
          name="paymentInstructions"
          label="Payment instructions"
          hint="Optional — e.g. bank name, account number, account name"
          rows={3}
        />
        <TextAreaField name="notes" label="Additional notes" hint="Optional" rows={2} />
        <TextField name="footerMessage" label="Thank-you message" hint="Optional — shown at the bottom of the invoice" />
      </FormSection>
    </div>
  );
}

function DiscountField() {
  const id = useId();
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>();
  const discountType = watch('discountType');
  const error = errors.discountValue?.message;

  return (
    <div className="grid grid-cols-[minmax(0,9rem)_1fr] gap-3">
      <div>
        <label htmlFor={`${id}-type`} className="mb-1 block text-sm font-medium text-slate-700">
          Discount type
        </label>
        <select id={`${id}-type`} className={inputClasses(false)} {...register('discountType')}>
          <option value="fixed">Amount (Rs.)</option>
          <option value="percentage">Percentage (%)</option>
        </select>
      </div>
      <FieldShell id={`${id}-value`} label="Discount" error={error} hint="Leave empty for no discount">
        <div className="relative">
          <input
            id={`${id}-value`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-value-error` : `${id}-value-hint`}
            className={inputClasses(Boolean(error), discountType === 'fixed' ? 'pl-10 text-right tabular-nums' : 'pr-8 text-right tabular-nums')}
            {...register('discountValue')}
          />
          <span
            className={`pointer-events-none absolute inset-y-0 flex items-center text-sm text-slate-500 ${
              discountType === 'fixed' ? 'left-3' : 'right-3'
            }`}
            aria-hidden="true"
          >
            {discountType === 'fixed' ? 'Rs.' : '%'}
          </span>
        </div>
      </FieldShell>
    </div>
  );
}
