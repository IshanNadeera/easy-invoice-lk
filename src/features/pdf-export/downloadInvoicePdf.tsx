import type { InvoiceView } from '../../lib/invoice-view';

/**
 * Generates the PDF entirely in the browser. @react-pdf/renderer and the
 * document are imported lazily so they are not part of the initial bundle.
 */
export async function generateInvoicePdfBlob(view: InvoiceView): Promise<Blob> {
  const [{ pdf }, { InvoicePdfDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('./InvoicePdfDocument'),
  ]);
  return pdf(<InvoicePdfDocument view={view} />).toBlob();
}

export function triggerFileDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoke later: some mobile browsers read the URL asynchronously after click().
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function downloadInvoicePdf(view: InvoiceView, fileName: string): Promise<void> {
  const blob = await generateInvoicePdfBlob(view);
  triggerFileDownload(blob, fileName);
}
