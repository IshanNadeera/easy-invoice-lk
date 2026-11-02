import { WATERMARK_TEXT } from '../../lib/config';
import type { InvoiceView } from '../../lib/invoice-view';

/**
 * HTML rendering of the invoice. Mirrors the layout of InvoicePdfDocument and
 * consumes the same InvoiceView, so numbers are identical. Also used for printing.
 */
export function InvoicePreview({ view, showPlaceholders = true }: { view: InvoiceView; showPlaceholders?: boolean }) {
  const placeholder = (value: string, fallback: string) =>
    value ? value : showPlaceholders ? <span className="text-slate-300">{fallback}</span> : null;

  return (
    <article
      className="invoice-sheet mx-auto w-full max-w-[794px] bg-white p-6 text-[12px] leading-snug text-slate-800 shadow-sm ring-1 ring-slate-200 sm:p-10 sm:text-[13px]"
      aria-label="Invoice preview"
    >
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between print:flex-row">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold break-words text-slate-900 sm:text-2xl">
            {placeholder(view.business.name, 'Your business name')}
          </h2>
          <ContactLines lines={[view.business.address, view.business.phone, view.business.email, view.business.website]} />
        </div>
        <div className="shrink-0 sm:text-right print:text-right">
          <p className="text-2xl font-bold tracking-wide text-brand-700 sm:text-3xl">INVOICE</p>
          <dl className="mt-2 grid grid-cols-[auto_auto] justify-start gap-x-4 gap-y-0.5 sm:justify-end print:justify-end">
            <dt className="text-slate-500">Invoice no.</dt>
            <dd className="font-semibold break-all text-slate-900">{placeholder(view.invoiceNumber, '—')}</dd>
            <dt className="text-slate-500">Date</dt>
            <dd>{placeholder(view.invoiceDate, '—')}</dd>
            {view.dueDate ? (
              <>
                <dt className="text-slate-500">Due date</dt>
                <dd>{view.dueDate}</dd>
              </>
            ) : null}
          </dl>
        </div>
      </header>

      <section className="mt-8">
        <h3 className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Bill to</h3>
        <p className="mt-1 font-semibold break-words text-slate-900">{placeholder(view.customer.name, 'Customer name')}</p>
        <ContactLines lines={[view.customer.address, view.customer.phone, view.customer.email]} />
      </section>

      <table className="mt-6 w-full table-fixed border-collapse">
        <colgroup>
          <col className="w-8" />
          <col />
          <col className="w-14 sm:w-16" />
          <col className="w-24 sm:w-28" />
          <col className="w-24 sm:w-28" />
        </colgroup>
        <thead>
          <tr className="bg-slate-100 text-left text-[11px] font-semibold tracking-wide text-slate-600 uppercase">
            <th scope="col" className="px-2 py-2">
              #
            </th>
            <th scope="col" className="px-2 py-2">
              Description
            </th>
            <th scope="col" className="px-2 py-2 text-right">
              Qty
            </th>
            <th scope="col" className="px-2 py-2 text-right">
              Unit price
            </th>
            <th scope="col" className="px-2 py-2 text-right">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {view.items.map((item, index) => (
            <tr key={item.id} className="invoice-row border-b border-slate-200 align-top">
              <td className="px-2 py-2 text-slate-500">{index + 1}</td>
              <td className="px-2 py-2 break-words whitespace-pre-line">{placeholder(item.description, 'Item description')}</td>
              <td className="px-2 py-2 text-right tabular-nums">{item.quantity}</td>
              <td className="px-2 py-2 text-right break-words tabular-nums">{item.unitPrice}</td>
              <td className="px-2 py-2 text-right break-words tabular-nums">{item.lineTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-totals mt-4 flex justify-end">
        <dl className="w-full max-w-[18rem] space-y-1">
          <div className="flex justify-between gap-4 px-2">
            <dt className="text-slate-600">Subtotal</dt>
            <dd className="tabular-nums">{view.subtotal}</dd>
          </div>
          {view.hasDiscount ? (
            <div className="flex justify-between gap-4 px-2">
              <dt className="text-slate-600">{view.discountLabel}</dt>
              <dd className="tabular-nums">{view.discountAmount}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 rounded bg-brand-50 px-2 py-2 text-[14px] font-bold text-slate-900 print:bg-slate-100">
            <dt>Total (LKR)</dt>
            <dd className="tabular-nums" data-testid="preview-total">
              {view.total}
            </dd>
          </div>
        </dl>
      </div>

      {view.paymentInstructions || view.notes ? (
        <section className="mt-8 space-y-4">
          {view.paymentInstructions ? (
            <div>
              <h3 className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Payment instructions</h3>
              <p className="mt-1 break-words whitespace-pre-line">{view.paymentInstructions}</p>
            </div>
          ) : null}
          {view.notes ? (
            <div>
              <h3 className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">Notes</h3>
              <p className="mt-1 break-words whitespace-pre-line">{view.notes}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {view.footerMessage ? (
        <p className="mt-8 text-center font-medium break-words text-slate-700">{view.footerMessage}</p>
      ) : null}

      <footer className="mt-10 border-t border-slate-100 pt-3 text-center text-[10px] text-slate-400">{WATERMARK_TEXT}</footer>
    </article>
  );
}

function ContactLines({ lines }: { lines: string[] }) {
  const visible = lines.filter(Boolean);
  if (visible.length === 0) return null;
  return (
    <div className="mt-1 space-y-0.5 text-slate-600">
      {visible.map((line, i) => (
        <p key={i} className="break-words whitespace-pre-line">
          {line}
        </p>
      ))}
    </div>
  );
}
