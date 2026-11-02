# EasyInvoice LK

Create a professional invoice in 60 seconds — no login required.
A free, mobile-first invoice generator for Sri Lankan freelancers and small businesses.

This is the **Phase 1 frontend-only MVP** described in `EasyInvoice_LK_Complete_Development_Blueprint.md`:
no backend, no accounts, no payments. Invoice data never leaves the browser.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Hook Form · Zod · @react-pdf/renderer · React Router ·
Vitest + Testing Library · Playwright · hosted on Vercel.

## Getting started

```bash
nvm use            # Node 22 (>= 20.19 required by Vite 7)
npm install
cp .env.example .env.local   # set VITE_CONTACT_EMAIL before launch
npm run dev
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Type-check and production build |
| `npm run check` | Type-check + lint + unit/component tests |
| `npm test` | Unit and component tests (Vitest) |
| `npx playwright install` then `npm run test:e2e` | End-to-end tests (desktop Chrome, Android Chrome, iPhone Safari) |

## Project structure

```text
src/
  app/                      App + route table (data router, lazy pages)
  components/
    common/                 Button, ConfirmDialog
    forms/                  Form field primitives (labels, errors, a11y)
    layout/                 Header/footer layout, legal page shell
  features/
    invoice-creator/        Form sections and dynamic line items
    invoice-preview/        HTML invoice (live preview + print)
    pdf-export/             react-pdf document + lazy download helper
  lib/
    money.ts                BigInt minor-unit parsing/formatting
    calculations.ts         The ONLY place invoice maths happens
    validation.ts           Zod schema (form + business rules)
    invoice-view.ts         Display model shared by preview and PDF
    dates.ts, defaults.ts, config.ts
  pages/                    Home, Create, Privacy, Terms, 404, error
tests/
  unit/  component/  e2e/
```

## Key design decisions

1. **Money is BigInt minor units.** Prices are cents, quantities thousandths, percentages basis points.
   No floating-point arithmetic anywhere in calculations. Input with more decimals than allowed is
   rejected, not silently rounded.
2. **Rounding:** each line total is rounded half-up to the cent; the subtotal is the sum of rounded lines
   (so printed lines always add up); percentage discounts are rounded half-up;
   `total = max(0, subtotal − discount)`. Tax is out of scope for the MVP.
3. **One calculation path.** `calculateInvoice` → `buildInvoiceView` produces the strings rendered by
   *both* the HTML preview and the PDF, so they cannot disagree.
4. **PDF via @react-pdf/renderer**, generated in the browser and lazy-loaded on first download so it
   does not slow the landing page. Rows never split across pages, the table header repeats on each page,
   the last item is kept with the totals, and every page has a footer with page numbers and the watermark.
5. **Print** uses the HTML preview with a print stylesheet (A4, preview only).
6. **In-memory only.** No localStorage. Leaving the page with unsaved changes prompts a confirmation.
7. **Watermark:** a small "Created with EasyInvoice LK" footer on every PDF page, the preview and print.
   It is defined in `src/lib/config.ts` so the future Pro entitlement can switch it off in one place.
8. **Security headers** (CSP, HSTS, frame-ancestors, etc.) are set in `vercel.json`.

## Deploying to Vercel

1. Import the repository in Vercel (framework preset: Vite — `vercel.json` already sets build/output).
2. Add environment variables `VITE_CONTACT_EMAIL` and optionally `VITE_APP_URL`.
3. Deploy a **preview** first and test PDF download on Chrome, Safari (macOS + iPhone) and Android
   before promoting to production — the CSP is strict and must be verified against the PDF library.

## Known limitations / next steps

- **Sinhala and Tamil text is not supported in the PDF yet** (built-in Helvetica font). Needs a registered
  Noto Sans Sinhala / Tamil font.
- No logo upload, templates, draft recovery or analytics yet (by design for v1).
- Share via the Web Share API (direct WhatsApp share on mobile) is a planned improvement.
- Contact email must be configured before launch (Definition of Done).
