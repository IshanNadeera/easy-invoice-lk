/**
 * PDF layout built with @react-pdf/renderer. Only loaded on demand (see
 * downloadInvoicePdf.tsx) because the library is large.
 *
 * Fonts: uses the built-in Helvetica, which covers English text and "Rs.".
 * Sinhala/Tamil text needs a registered Unicode font (e.g. Noto Sans Sinhala)
 * before it will render — tracked as a follow-up.
 */
import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { WATERMARK_TEXT } from '../../lib/config';
import type { InvoiceView, InvoiceViewItem } from '../../lib/invoice-view';

// Break very long unbroken strings (URLs, account numbers) so they wrap instead
// of overflowing the column. Normal words are left intact (no auto-hyphenation).
Font.registerHyphenationCallback((word) => {
  if (word.length <= 18) return [word];
  const chunks: string[] = [];
  for (let i = 0; i < word.length; i += 12) chunks.push(word.slice(i, i + 12));
  return chunks;
});

const BRAND = '#0f766e';
const TEXT = '#1e293b';
const MUTED = '#64748b';
const BORDER = '#e2e8f0';

const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 64,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    lineHeight: 1.35,
    color: TEXT,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  headerLeft: { flex: 1, paddingRight: 24 },
  // Large text needs its own lineHeight: the page-level value is resolved against the
  // 9.5pt body size, which makes 16–22pt headings overlap the lines below them.
  businessName: { fontFamily: 'Helvetica-Bold', fontSize: 16, lineHeight: 1.25, color: '#0f172a', marginBottom: 6 },
  muted: { color: MUTED },
  headerRight: { width: 190, alignItems: 'flex-end' },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 22, lineHeight: 1.15, color: BRAND, letterSpacing: 1, marginBottom: 10 },
  metaRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 2 },
  metaLabel: { color: MUTED, width: 70, textAlign: 'right', marginRight: 8 },
  metaValue: { width: 112, textAlign: 'right' },
  metaValueBold: { width: 112, textAlign: 'right', fontFamily: 'Helvetica-Bold' },
  sectionLabel: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: MUTED, letterSpacing: 0.8, marginBottom: 3 },
  billTo: { marginTop: 28 },
  customerName: { fontFamily: 'Helvetica-Bold', fontSize: 11, lineHeight: 1.3, color: '#0f172a', marginBottom: 3 },
  table: { marginTop: 20 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: '#475569',
  },
  row: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 0.75, borderBottomColor: BORDER },
  colIndex: { width: 22, paddingHorizontal: 4, color: MUTED },
  colDesc: { flex: 1, paddingHorizontal: 4 },
  colQty: { width: 52, paddingHorizontal: 4, textAlign: 'right' },
  colPrice: { width: 88, paddingHorizontal: 4, textAlign: 'right' },
  colAmount: { width: 92, paddingHorizontal: 4, textAlign: 'right' },
  totals: { marginTop: 12, alignSelf: 'flex-end', width: 240 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6, paddingVertical: 2 },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 7,
    backgroundColor: '#f0fdfa',
    fontFamily: 'Helvetica-Bold',
    fontSize: 11.5,
    lineHeight: 1.3,
    color: '#0f172a',
  },
  notesBlock: { marginTop: 22 },
  footerMessage: { marginTop: 26, textAlign: 'center', fontFamily: 'Helvetica-Bold', color: '#334155' },
  pageFooter: {
    position: 'absolute',
    left: 40,
    right: 40,
    bottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    paddingTop: 6,
    fontSize: 7.5,
    color: '#94a3b8',
  },
});

function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.filter(Boolean).map((line, i) => (
        <Text key={i} style={s.muted}>
          {line}
        </Text>
      ))}
    </>
  );
}

function ItemRow({ item, index }: { item: InvoiceViewItem; index: number }) {
  return (
    <View style={s.row} wrap={false}>
      <Text style={s.colIndex}>{index + 1}</Text>
      <Text style={s.colDesc}>{item.description}</Text>
      <Text style={s.colQty}>{item.quantity}</Text>
      <Text style={s.colPrice}>{item.unitPrice}</Text>
      <Text style={s.colAmount}>{item.lineTotal}</Text>
    </View>
  );
}

function Totals({ view }: { view: InvoiceView }) {
  return (
    <View style={s.totals}>
      <View style={s.totalRow}>
        <Text style={s.muted}>Subtotal</Text>
        <Text>{view.subtotal}</Text>
      </View>
      {view.hasDiscount ? (
        <View style={s.totalRow}>
          <Text style={s.muted}>{view.discountLabel}</Text>
          <Text>{view.discountAmount}</Text>
        </View>
      ) : null}
      <View style={s.grandTotal}>
        <Text>Total (LKR)</Text>
        <Text>{view.total}</Text>
      </View>
    </View>
  );
}

export function InvoicePdfDocument({ view }: { view: InvoiceView }) {
  const leadingItems = view.items.slice(0, -1);
  const lastItem = view.items[view.items.length - 1];

  return (
    <Document
      title={`Invoice ${view.invoiceNumber}`}
      author={view.business.name}
      subject={`Invoice ${view.invoiceNumber} for ${view.customer.name}`}
      creator="EasyInvoice LK"
      producer="EasyInvoice LK"
    >
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.businessName}>{view.business.name}</Text>
            <Lines lines={[view.business.address, view.business.phone, view.business.email, view.business.website]} />
          </View>
          <View style={s.headerRight}>
            <Text style={s.title}>INVOICE</Text>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Invoice no.</Text>
              <Text style={s.metaValueBold}>{view.invoiceNumber}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Date</Text>
              <Text style={s.metaValue}>{view.invoiceDate}</Text>
            </View>
            {view.dueDate ? (
              <View style={s.metaRow}>
                <Text style={s.metaLabel}>Due date</Text>
                <Text style={s.metaValue}>{view.dueDate}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={s.billTo}>
          <Text style={s.sectionLabel}>BILL TO</Text>
          <Text style={s.customerName}>{view.customer.name}</Text>
          <Lines lines={[view.customer.address, view.customer.phone, view.customer.email]} />
        </View>

        <View style={s.table}>
          {/* `fixed` repeats the header row at the top of each page the table continues onto. */}
          <View style={s.tableHeader} fixed>
            <Text style={s.colIndex}>#</Text>
            <Text style={s.colDesc}>DESCRIPTION</Text>
            <Text style={s.colQty}>QTY</Text>
            <Text style={s.colPrice}>UNIT PRICE</Text>
            <Text style={s.colAmount}>AMOUNT</Text>
          </View>
          {leadingItems.map((item, index) => (
            <ItemRow key={item.id} item={item} index={index} />
          ))}
          {/* Keep the last item together with the totals so totals never sit alone on a page. */}
          {lastItem ? (
            <View wrap={false}>
              <ItemRow item={lastItem} index={view.items.length - 1} />
              <Totals view={view} />
            </View>
          ) : null}
        </View>

        {view.paymentInstructions ? (
          <View style={s.notesBlock} minPresenceAhead={40}>
            <Text style={s.sectionLabel}>PAYMENT INSTRUCTIONS</Text>
            <Text>{view.paymentInstructions}</Text>
          </View>
        ) : null}
        {view.notes ? (
          <View style={s.notesBlock} minPresenceAhead={40}>
            <Text style={s.sectionLabel}>NOTES</Text>
            <Text>{view.notes}</Text>
          </View>
        ) : null}
        {view.footerMessage ? <Text style={s.footerMessage}>{view.footerMessage}</Text> : null}

        <View style={s.pageFooter} fixed>
          <Text>{WATERMARK_TEXT}</Text>
          <Text render={({ pageNumber, totalPages }) => `${view.invoiceNumber} · Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
