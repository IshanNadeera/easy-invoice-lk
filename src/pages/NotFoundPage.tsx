import { Link } from 'react-router';
import { buttonClasses } from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <title>Page not found · EasyInvoice LK</title>
      <p className="text-sm font-semibold text-brand-700">404</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-3 text-slate-600">The page you are looking for does not exist or has moved.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/" className={buttonClasses('secondary')}>
          Go home
        </Link>
        <Link to="/create" className={buttonClasses('primary')}>
          Create an invoice
        </Link>
      </div>
    </div>
  );
}
