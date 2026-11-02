import { LegalPage } from '../components/layout/LegalPage';
import { CONTACT_EMAIL } from '../lib/config';

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="2 November 2026">
      <p>
        EasyInvoice LK is built so that you can create invoices without giving us your data. This page explains what
        happens to the information you enter.
      </p>

      <h2>Invoice data stays in your browser</h2>
      <ul>
        <li>Everything you type — business details, customer details, items and amounts — is processed only in your browser.</li>
        <li>Your invoice is never uploaded to our servers, and we have no account system.</li>
        <li>The PDF is generated on your device and saved directly to your downloads.</li>
        <li>
          Invoice data is kept in memory only. It is not saved in your browser storage, so refreshing or closing the page
          clears it. Use the <strong>Clear</strong> button to remove it at any time.
        </li>
      </ul>

      <h2>Hosting</h2>
      <p>
        The website is hosted by Vercel. Like most web hosts, Vercel may process standard technical information such as
        your IP address, browser type and the pages requested in order to deliver and secure the site. This information
        does not include your invoice contents.
      </p>

      <h2>Analytics and cookies</h2>
      <p>
        We do not currently use analytics or tracking cookies. If we add privacy-friendly usage analytics in the future,
        they will never include invoice contents, customer names, phone numbers, addresses or amounts, and we will update
        this policy first.
      </p>

      <h2>Contact</h2>
      <p>
        {CONTACT_EMAIL ? (
          <>
            Questions about privacy? Email <a className="text-brand-700 underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </>
        ) : (
          'Contact details will be published here before the public launch.'
        )}
      </p>
    </LegalPage>
  );
}
