import { useEffect, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { buttonClasses } from '../components/common/Button';
import { InvoicePreview } from '../features/invoice-preview/InvoicePreview';
import { CONTACT_EMAIL } from '../lib/config';
import { SAMPLE_INVOICE } from '../lib/defaults';
import { buildInvoiceView } from '../lib/invoice-view';

const SAMPLE_VIEW = buildInvoiceView(SAMPLE_INVOICE);

const FEATURES = [
  { title: 'No sign-up', body: 'Open the page and start typing. No account, no email, no password.' },
  { title: 'Made for your phone', body: 'Fill in the invoice comfortably on a mobile screen and preview it instantly.' },
  { title: 'Clean A4 PDF', body: 'Download a professional PDF ready to send by WhatsApp or email, or print it.' },
  { title: 'Rupees done right', body: 'Totals and discounts are calculated precisely and shown in LKR, e.g. Rs. 25,000.00.' },
  { title: 'Private', body: 'Your invoice is created in your browser. Nothing is uploaded to our servers.' },
  { title: 'Free', body: 'Creating and downloading invoices is free, with no limit on how many you make.' },
];

const FREE_FEATURES = [
  'Unlimited invoices',
  'PDF download and printing',
  'Fixed or percentage discounts',
  'Payment instructions and notes',
  'Small “Created with EasyInvoice LK” footer',
];

const PRO_FEATURES = [
  'No EasyInvoice LK footer',
  'Your business logo',
  'Saved business profile and customers',
  'Invoice history and payment status',
  'Premium templates',
];

const FAQS = [
  {
    q: 'Do I need to create an account?',
    a: 'No. You can create and download as many invoices as you like without signing up.',
  },
  {
    q: 'Is my invoice data stored anywhere?',
    a: 'No. Your invoice is created in your browser and is not uploaded. Refreshing or closing the page clears it, so download your PDF before you leave.',
  },
  {
    q: 'How do I send the invoice on WhatsApp?',
    a: 'Download the PDF, then open the WhatsApp chat with your customer, tap the attachment icon and choose the file from your downloads.',
  },
  {
    q: 'Can I add tax (VAT) to my invoice?',
    a: 'Not yet. Tax rules depend on your business, so we are keeping tax out of the first version. Please check with your accountant about what your invoices must include.',
  },
  {
    q: 'Can I use Sinhala or Tamil?',
    a: 'The first version supports English text. Sinhala and Tamil support is on our list — let us know if you need it.',
  },
];

export default function HomePage() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  return (
    <>
      <title>EasyInvoice LK — Free invoice generator for Sri Lanka</title>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="text-sm font-semibold text-brand-700">Free for Sri Lankan businesses</p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Create professional invoices in 60 seconds
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Simple invoice creation for Sri Lankan freelancers, online sellers and small businesses. No account needed.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/create" className={buttonClasses('primary', 'lg')}>
                Create free invoice
              </Link>
              <a href="#how-it-works" className={buttonClasses('ghost', 'lg')}>
                How it works
              </a>
            </div>
            <p className="mt-3 text-sm text-slate-500">No sign-up · Download as PDF · Works on your phone</p>
          </div>
          <div className="relative hidden sm:block" aria-hidden="true">
            <div className="pointer-events-none origin-top scale-[0.85] select-none lg:scale-90">
              <InvoicePreview view={SAMPLE_VIEW} showPlaceholders={false} />
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-4 px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ['Enter your details', 'Add your business, your customer and the items you are billing for.'],
            ['Check the preview', 'Totals are calculated as you type. See exactly what your customer will get.'],
            ['Download and send', 'Save the PDF and send it by WhatsApp or email, or print it.'],
          ].map(([title, body], i) => (
            <li key={title} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900">Everything you need for a simple invoice</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900">Free today. Pro when you need more.</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <PlanCard name="Free" badge="Available now" features={FREE_FEATURES} highlighted>
            <Link to="/create" className={buttonClasses('primary', 'md', 'w-full')}>
              Create free invoice
            </Link>
          </PlanCard>
          <PlanCard name="Pro" badge="Coming later" features={PRO_FEATURES}>
            {CONTACT_EMAIL ? (
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=Interested%20in%20EasyInvoice%20LK%20Pro`}
                className={buttonClasses('secondary', 'md', 'w-full')}
              >
                Tell me when Pro is ready
              </a>
            ) : (
              <p className="text-center text-sm text-slate-500">We are building this based on your feedback.</p>
            )}
          </PlanCard>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-slate-200">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-slate-900">
                  {faq.q}
                  <span className="ml-4 text-slate-400 transition-transform group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-sm text-slate-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-3xl scroll-mt-4 px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900">About EasyInvoice LK</h2>
        <p className="mt-3 text-slate-600">
          EasyInvoice LK is a small, independent tool built in Sri Lanka for people who would rather spend time on their
          work than on formatting invoices in Word or Excel. We are improving it based on feedback from real users
          {CONTACT_EMAIL ? (
            <>
              {' '}
              —{' '}
              <a className="text-brand-700 underline" href={`mailto:${CONTACT_EMAIL}?subject=EasyInvoice%20LK%20feedback`}>
                tell us what you need
              </a>
            </>
          ) : null}
          .
        </p>
      </section>
    </>
  );
}

function PlanCard({
  name,
  badge,
  features,
  highlighted = false,
  children,
}: {
  name: string;
  badge: string;
  features: string[];
  highlighted?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ${highlighted ? 'ring-2 ring-brand-600' : 'ring-slate-200'}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">{name}</h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            highlighted ? 'bg-brand-100 text-brand-800' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {badge}
        </span>
      </div>
      <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-700">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="text-brand-700" aria-hidden="true">
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-6">{children}</div>
    </div>
  );
}
