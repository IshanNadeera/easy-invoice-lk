import { useId } from 'react';
import { get, useFieldArray, useFormContext, type FieldError } from 'react-hook-form';
import { Button } from '../../components/common/Button';
import { inputClasses } from '../../components/forms/fields';
import { MAX_ITEMS } from '../../lib/calculations';
import { createEmptyItem } from '../../lib/defaults';
import type { InvoiceFormValues } from '../../lib/validation';

interface LineItemsFieldProps {
  /** Formatted line totals from the shared invoice view, by index. */
  lineTotals: readonly string[];
}

export function LineItemsField({ lineTotals }: LineItemsFieldProps) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'items', keyName: 'key' });
  const baseId = useId();

  const listError = (errors.items?.root?.message ?? errors.items?.message) as string | undefined;

  return (
    <div>
      <ol className="space-y-3" aria-label="Invoice items">
        {fields.map((field, index) => {
          const fieldError = (key: 'description' | 'quantity' | 'unitPrice') =>
            (get(errors, `items.${index}.${key}`) as FieldError | undefined)?.message;
          const descriptionError = fieldError('description');
          const quantityError = fieldError('quantity');
          const priceError = fieldError('unitPrice');
          const rowId = `${baseId}-${index}`;

          return (
            <li key={field.key} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
              <div className="flex items-start justify-between gap-2">
                <span className="mt-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">Item {index + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  aria-label={`Remove item ${index + 1}`}
                  className="-mt-1 -mr-1 text-red-700 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>

              <div className="mt-2">
                <label htmlFor={`${rowId}-desc`} className="sr-only">
                  Item {index + 1} description
                </label>
                <textarea
                  id={`${rowId}-desc`}
                  rows={2}
                  placeholder="Description, e.g. Website design"
                  aria-invalid={descriptionError ? true : undefined}
                  aria-describedby={descriptionError ? `${rowId}-desc-error` : undefined}
                  className={inputClasses(Boolean(descriptionError), 'resize-y')}
                  {...register(`items.${index}.description`)}
                />
                {descriptionError ? (
                  <p id={`${rowId}-desc-error`} className="mt-1 text-sm text-red-600">
                    {descriptionError}
                  </p>
                ) : null}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-[6rem_1fr_auto] sm:items-start">
                <div>
                  <label htmlFor={`${rowId}-qty`} className="mb-1 block text-xs font-medium text-slate-600">
                    Qty<span className="sr-only">, item {index + 1}</span>
                  </label>
                  <input
                    id={`${rowId}-qty`}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    aria-invalid={quantityError ? true : undefined}
                    aria-describedby={quantityError ? `${rowId}-qty-error` : undefined}
                    className={inputClasses(Boolean(quantityError), 'text-right tabular-nums')}
                    {...register(`items.${index}.quantity`)}
                  />
                </div>
                <div>
                  <label htmlFor={`${rowId}-price`} className="mb-1 block text-xs font-medium text-slate-600">
                    Unit price (Rs.)<span className="sr-only">, item {index + 1}</span>
                  </label>
                  <input
                    id={`${rowId}-price`}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0.00"
                    aria-invalid={priceError ? true : undefined}
                    aria-describedby={priceError ? `${rowId}-price-error` : undefined}
                    className={inputClasses(Boolean(priceError), 'text-right tabular-nums')}
                    {...register(`items.${index}.unitPrice`)}
                  />
                </div>
                <div className="col-span-2 flex items-baseline justify-between sm:col-span-1 sm:block sm:text-right">
                  <span className="block text-xs font-medium text-slate-600 sm:mb-1">Amount</span>
                  <span
                    className="block py-2 font-semibold text-slate-900 tabular-nums"
                    data-testid={`line-total-${index}`}
                  >
                    {lineTotals[index] ?? 'Rs. 0.00'}
                  </span>
                </div>
              </div>

              {quantityError || priceError ? (
                <div className="mt-1 space-y-1">
                  {quantityError ? (
                    <p id={`${rowId}-qty-error`} className="text-sm text-red-600">
                      {quantityError}
                    </p>
                  ) : null}
                  {priceError ? (
                    <p id={`${rowId}-price-error`} className="text-sm text-red-600">
                      {priceError}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      {listError ? <p className="mt-2 text-sm text-red-600">{listError}</p> : null}

      <div className="mt-3 flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          onClick={() => append(createEmptyItem(), { shouldFocus: true, focusName: `items.${fields.length}.description` })}
          disabled={fields.length >= MAX_ITEMS}
        >
          + Add item
        </Button>
        {fields.length >= MAX_ITEMS ? (
          <span className="text-xs text-slate-500">Maximum of {MAX_ITEMS} items reached</span>
        ) : null}
      </div>
    </div>
  );
}
