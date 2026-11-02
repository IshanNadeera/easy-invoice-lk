import { isRouteErrorResponse, useRouteError } from 'react-router';

/** Last-resort error screen. Avoids showing stack traces to users. */
export default function RouteErrorPage() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) console.error(error);

  const isChunkError = error instanceof Error && /dynamically imported module|Loading chunk/i.test(error.message);

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
      <p className="mt-3 text-slate-600">
        {isChunkError
          ? 'A new version of EasyInvoice LK is available. Please reload the page.'
          : 'An unexpected error occurred. Please reload the page and try again.'}
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-8 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
      >
        Reload page
      </button>
    </div>
  );
}
