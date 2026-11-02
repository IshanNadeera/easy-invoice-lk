import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
import { FormProvider, useForm, type SubmitErrorHandler } from 'react-hook-form';
import { useBlocker } from 'react-router';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { InvoiceForm } from '../features/invoice-creator/InvoiceForm';
import { InvoicePreview } from '../features/invoice-preview/InvoicePreview';
import { downloadInvoicePdf } from '../features/pdf-export/downloadInvoicePdf';
import { createDefaultValues } from '../lib/defaults';
import { buildInvoiceView, invoicePdfFileName } from '../lib/invoice-view';
import { invoiceSchema, type InvoiceFormValues } from '../lib/validation';

type Tab = 'edit' | 'preview';
type Status =
  | { kind: 'idle' }
  | { kind: 'generating' }
  | { kind: 'downloaded'; fileName: string }
  | { kind: 'invalid' }
  | { kind: 'error' };

export default function CreateInvoicePage() {
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: createDefaultValues(),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });
  const { isDirty } = form.formState;

  const [tab, setTab] = useState<Tab>('edit');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [confirmingClear, setConfirmingClear] = useState(false);

  // Re-renders on every change so the preview stays live. All totals come from
  // the shared calculation module via buildInvoiceView.
  const values = form.watch();
  const view = buildInvoiceView(values);

  useUnsavedChangesWarning(isDirty);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  const onInvalid: SubmitErrorHandler<InvoiceFormValues> = () => {
    setStatus({ kind: 'invalid' });
    setTab('edit');
    // Wait for the form tab to become visible before focusing (mobile layout).
    requestAnimationFrame(() => {
      const firstInvalid = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      firstInvalid?.focus();
      firstInvalid?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  };

  const onDownload = form.handleSubmit(async (data) => {
    setStatus({ kind: 'generating' });
    const fileName = invoicePdfFileName(data.invoiceNumber);
    try {
      await downloadInvoicePdf(buildInvoiceView(data), fileName);
      setStatus({ kind: 'downloaded', fileName });
    } catch (error) {
      console.error('PDF generation failed', error);
      setStatus({ kind: 'error' });
    }
  }, onInvalid);

  const onPrint = form.handleSubmit(() => {
    setStatus({ kind: 'idle' });
    window.print();
  }, onInvalid);

  const clearForm = useCallback(() => {
    form.reset(createDefaultValues());
    setStatus({ kind: 'idle' });
    setTab('edit');
    setConfirmingClear(false);
    window.scrollTo({ top: 0 });
  }, [form]);

  const cancelClear = useCallback(() => setConfirmingClear(false), []);
  const cancelLeave = useCallback(() => blocker.reset?.(), [blocker]);
  const confirmLeave = useCallback(() => blocker.proceed?.(), [blocker]);

  const generating = status.kind === 'generating';

  return (
    <>
      <title>Create invoice · EasyInvoice LK</title>
      <div className="mx-auto max-w-7xl px-4 pt-4 pb-28 sm:px-6 lg:pb-10">
        <div className="print:hidden">
          <h1 className="text-2xl font-bold text-slate-900">Create invoice</h1>
          <p className="mt-1 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-900 ring-1 ring-brand-100">
            <strong>Private by design:</strong> your invoice stays in this browser and is never uploaded. Nothing is saved —
            refreshing or closing the page clears it.
          </p>

          <div role="tablist" aria-label="Invoice view" className="mt-4 grid grid-cols-2 rounded-lg bg-slate-200 p-1 lg:hidden">
            <TabButton id="tab-edit" controls="panel-edit" selected={tab === 'edit'} onSelect={() => setTab('edit')}>
              Edit
            </TabButton>
            <TabButton id="tab-preview" controls="panel-preview" selected={tab === 'preview'} onSelect={() => setTab('preview')}>
              Preview
            </TabButton>
          </div>
        </div>

        <div className="mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-8">
          <FormProvider {...form}>
            <form
              id="panel-edit"
              role="tabpanel"
              aria-labelledby="tab-edit"
              noValidate
              onSubmit={onDownload}
              onKeyDown={preventImplicitSubmit}
              className={`${tab === 'edit' ? 'block' : 'hidden'} lg:block print:hidden`}
            >
              <InvoiceForm view={view} />
            </form>
          </FormProvider>

          <section
            id="panel-preview"
            role="tabpanel"
            aria-labelledby="tab-preview"
            className={`print-area ${tab === 'preview' ? 'block' : 'hidden'} lg:sticky lg:top-4 lg:block`}
          >
            <p className="mb-2 hidden text-sm font-medium text-slate-500 lg:block print:hidden">Live preview</p>
            <div className="lg:max-h-[calc(100vh-7rem)] lg:overflow-auto lg:rounded-xl print:max-h-none print:overflow-visible">
              <InvoicePreview view={view} />
            </div>
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:static lg:border-0 lg:bg-transparent print:hidden">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:pb-8">
          <StatusMessage status={status} />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" form="panel-edit" size="lg" disabled={generating} className="flex-1 sm:flex-none">
              {generating ? 'Creating PDF…' : 'Download PDF'}
            </Button>
            <Button variant="secondary" size="lg" onClick={onPrint} disabled={generating}>
              Print
            </Button>
            <Button variant="ghost" size="lg" onClick={() => setConfirmingClear(true)} disabled={generating} className="ml-auto">
              Clear
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingClear}
        title="Clear this invoice?"
        description="All the details you entered will be removed. This cannot be undone."
        confirmLabel="Clear invoice"
        tone="danger"
        onConfirm={clearForm}
        onCancel={cancelClear}
      />
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Leave this page?"
        description="Your invoice is not saved anywhere. If you leave, the details you entered will be lost."
        confirmLabel="Leave page"
        cancelLabel="Stay"
        tone="danger"
        onConfirm={confirmLeave}
        onCancel={cancelLeave}
      />
    </>
  );
}

function TabButton({
  id,
  controls,
  selected,
  onSelect,
  children,
}: {
  id: string;
  controls: string;
  selected: boolean;
  onSelect: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-controls={controls}
      aria-selected={selected}
      onClick={onSelect}
      className={`rounded-md py-2 text-sm font-semibold transition-colors ${
        selected ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  );
}

function StatusMessage({ status }: { status: Status }) {
  let content: ReactNode = null;
  let tone = '';
  switch (status.kind) {
    case 'invalid':
      content = 'Please fix the highlighted fields before downloading or printing.';
      tone = 'text-red-700';
      break;
    case 'error':
      content = 'Sorry, the PDF could not be created. Please try again, or use Print and choose "Save as PDF".';
      tone = 'text-red-700';
      break;
    case 'downloaded':
      content = (
        <>
          <strong>{status.fileName}</strong> downloaded. To send it, open WhatsApp and attach the file from your downloads.
        </>
      );
      tone = 'text-brand-800';
      break;
    case 'generating':
      content = 'Creating your PDF…';
      tone = 'text-slate-600';
      break;
    default:
      content = null;
  }
  return (
    <p role="status" aria-live="polite" className={`text-sm ${tone} ${content ? 'mb-2' : 'sr-only'}`}>
      {content}
    </p>
  );
}

/** Stops the Enter key in a single-line input from triggering a PDF download. */
function preventImplicitSubmit(event: KeyboardEvent<HTMLFormElement>) {
  if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
    event.preventDefault();
  }
}

/** Warns before a refresh or tab close when there is unsaved invoice data. */
function useUnsavedChangesWarning(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Required by some browsers to show the prompt.
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [active]);
}
