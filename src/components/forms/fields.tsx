import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { get, useFormContext, type FieldError, type Path } from 'react-hook-form';
import type { InvoiceFormValues } from '../../lib/validation';

type FieldName = Path<InvoiceFormValues>;

const INPUT_BASE =
  'block w-full rounded-lg border-0 bg-white px-3 py-2 text-slate-900 shadow-sm ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:outline-none';

export function inputClasses(hasError: boolean, extra = '') {
  return `${INPUT_BASE} ${hasError ? 'ring-red-400 focus:ring-red-500' : 'ring-slate-300 focus:ring-brand-600'} ${extra}`;
}

function useFieldError(name: FieldName): string | undefined {
  const {
    formState: { errors },
  } = useFormContext<InvoiceFormValues>();
  const error = get(errors, name) as FieldError | undefined;
  return error?.message;
}

interface FieldShellProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FieldShell({ id, label, required, hint, error, children, className = '' }: FieldShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required ? (
          <span className="text-red-600" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'id'> {
  name: FieldName;
  label: string;
  hint?: string;
  className?: string;
  inputClassName?: string;
}

export function TextField({ name, label, hint, required, className, inputClassName = '', ...rest }: TextFieldProps) {
  const id = useId();
  const { register } = useFormContext<InvoiceFormValues>();
  const error = useFieldError(name);
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <input
        id={id}
        type="text"
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={inputClasses(Boolean(error), inputClassName)}
        {...rest}
        {...register(name)}
      />
    </FieldShell>
  );
}

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name' | 'id'> {
  name: FieldName;
  label: string;
  hint?: string;
  className?: string;
}

export function TextAreaField({ name, label, hint, required, className, rows = 2, ...rest }: TextAreaFieldProps) {
  const id = useId();
  const { register } = useFormContext<InvoiceFormValues>();
  const error = useFieldError(name);
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={inputClasses(Boolean(error), 'resize-y')}
        {...rest}
        {...register(name)}
      />
    </FieldShell>
  );
}

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
