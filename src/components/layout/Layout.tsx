import { Suspense } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router';
import { AUTHOR_FACEBOOK_URL, AUTHOR_NAME, CONTACT_EMAIL } from '../../lib/config';
import { buttonClasses } from '../common/Button';

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </div>
  );
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
      <img src="/favicon.svg" alt="" width={28} height={28} />
      <span>
        EasyInvoice <span className="text-brand-700">LK</span>
      </span>
    </span>
  );
}

function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white print:hidden">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" aria-label="EasyInvoice LK home">
          <Wordmark />
        </Link>
        <NavLink to="/create" className={buttonClasses('primary', 'sm')}>
          Create invoice
        </NavLink>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white print:hidden">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} EasyInvoice LK. Made in Sri Lanka by{' '}
          {AUTHOR_FACEBOOK_URL ? (
            <a
              href={AUTHOR_FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-700 underline-offset-2 hover:underline"
            >
              {AUTHOR_NAME}
              <span className="sr-only"> (Facebook profile, opens in a new tab)</span>
            </a>
          ) : (
            <span className="font-medium">{AUTHOR_NAME}</span>
          )}
          .
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link to="/#about" className="hover:text-slate-900">
            About
          </Link>
          <Link to="/privacy" className="hover:text-slate-900">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-slate-900">
            Terms
          </Link>
          {CONTACT_EMAIL ? (
            <a href={`mailto:${CONTACT_EMAIL}?subject=EasyInvoice%20LK%20feedback`} className="hover:text-slate-900">
              Contact &amp; feedback
            </a>
          ) : null}
        </nav>
      </div>
    </footer>
  );
}

function PageLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500" role="status">
      Loading…
    </div>
  );
}
