import { LegalPage } from '../components/layout/LegalPage';
import { CONTACT_EMAIL } from '../lib/config';

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="2 November 2026">
      <p>By using EasyInvoice LK you agree to these terms. If you do not agree, please do not use the service.</p>

      <h2>The service</h2>
      <p>
        EasyInvoice LK is a free tool for creating invoice documents in your browser. It is not accounting software and
        does not provide tax, legal or financial advice.
      </p>

      <h2>Your responsibilities</h2>
      <ul>
        <li>You are responsible for the accuracy and legality of the information on the invoices you create and issue.</li>
        <li>
          EasyInvoice LK does not guarantee that an invoice meets any particular tax or regulatory requirement. Please
          check with a qualified professional if you are unsure what your invoices must include.
        </li>
        <li>Do not use the service for fraudulent, misleading or unlawful purposes.</li>
      </ul>

      <h2>No warranty</h2>
      <p>
        The service is provided “as is”, without warranties of any kind. We aim to calculate totals correctly and test the
        tool carefully, but please review every invoice before you send it.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, EasyInvoice LK is not liable for any loss arising from the use of the service or of
        invoices created with it.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms. The “last updated” date above shows when they last changed.</p>

      <h2>Contact</h2>
      <p>
        {CONTACT_EMAIL ? (
          <>
            Email <a className="text-brand-700 underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </>
        ) : (
          'Contact details will be published here before the public launch.'
        )}
      </p>
    </LegalPage>
  );
}
