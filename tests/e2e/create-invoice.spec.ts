import { expect, test, type Page } from '@playwright/test';

async function fillBasics(page: Page) {
  await page.getByLabel(/^Business name/).fill('Lanka Creative Studio');
  await page.getByLabel(/^Customer name/).fill('Ceylon Tea Traders (Pvt) Ltd');
  await page.getByLabel('Item 1 description').fill('Logo design');
  await page.getByLabel('Unit price (Rs.), item 1').fill('25000');
}

test('landing page leads to the invoice creator without login', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('60 seconds');
  await page.getByRole('link', { name: 'Create free invoice' }).first().click();
  await expect(page).toHaveURL(/\/create$/);
  await expect(page.getByRole('heading', { name: 'Create invoice' })).toBeVisible();
});

test('creates an invoice with one item and downloads the PDF', async ({ page }) => {
  await page.goto('/create');
  await fillBasics(page);
  await expect(page.getByTestId('form-total')).toHaveText('Rs. 25,000.00');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('INV-0001.pdf');

  const path = await download.path();
  expect(path).toBeTruthy();
  await expect(page.getByRole('status')).toContainText('downloaded');
});

test('applies fixed and percentage discounts across several items', async ({ page }) => {
  await page.goto('/create');
  await fillBasics(page);
  await page.getByRole('button', { name: '+ Add item' }).click();
  await page.getByLabel('Item 2 description').fill('Social media posts');
  await page.getByLabel('Qty, item 2').fill('8');
  await page.getByLabel('Unit price (Rs.), item 2').fill('1500');
  await expect(page.getByTestId('form-subtotal')).toHaveText('Rs. 37,000.00');

  await page.getByLabel('Discount', { exact: true }).fill('2000');
  await expect(page.getByTestId('form-total')).toHaveText('Rs. 35,000.00');

  await page.getByLabel('Discount type').selectOption('percentage');
  await page.getByLabel('Discount', { exact: true }).fill('10');
  await expect(page.getByTestId('form-total')).toHaveText('Rs. 33,300.00');
});

test('generates a multi-page PDF with long descriptions', async ({ page }) => {
  await page.goto('/create');
  await fillBasics(page);
  await page
    .getByLabel('Item 1 description')
    .fill('Very long description '.repeat(30) + 'https://example.com/a-very-long-unbroken-url-that-should-wrap-correctly');
  for (let i = 2; i <= 25; i++) {
    await page.getByRole('button', { name: '+ Add item' }).click();
    await page.getByLabel(`Item ${i} description`).fill(`Service item ${i}`);
    await page.getByLabel(`Unit price (Rs.), item ${i}`).fill('1000');
  }

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  const fs = await import('node:fs/promises');
  const bytes = await fs.readFile(path);
  expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
  // Rough page count check: a PDF lists one "/Type /Page" object per page.
  const pageCount = (bytes.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
  expect(pageCount).toBeGreaterThan(1);
});

test('blocks download and shows errors when required fields are missing', async ({ page }) => {
  await page.goto('/create');
  await page.getByRole('button', { name: 'Download PDF' }).click();
  await expect(page.getByText('Business name is required')).toBeVisible();
  await expect(page.getByLabel(/^Business name/)).toBeFocused();
});
