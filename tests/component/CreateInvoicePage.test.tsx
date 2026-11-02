import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CreateInvoicePage from '../../src/pages/CreateInvoicePage';

const downloadMock = vi.fn<(view: unknown, fileName: string) => Promise<void>>();

vi.mock('../../src/features/pdf-export/downloadInvoicePdf', () => ({
  downloadInvoicePdf: (view: unknown, fileName: string) => downloadMock(view, fileName),
}));

function renderPage() {
  const router = createMemoryRouter(
    [
      { path: '/create', element: <CreateInvoicePage /> },
      { path: '/', element: <p>Home</p> },
    ],
    { initialEntries: ['/create'] },
  );
  const user = userEvent.setup();
  render(<RouterProvider router={router} />);
  return { user, router };
}

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Business name/), 'Lanka Studio');
  await user.type(screen.getByLabelText(/^Customer name/), 'Nimal Perera');
  await user.type(screen.getByLabelText('Item 1 description'), 'Logo design');
  await user.type(screen.getByLabelText('Unit price (Rs.), item 1'), '25000');
}

beforeEach(() => {
  downloadMock.mockReset();
  downloadMock.mockResolvedValue(undefined);
});

describe('CreateInvoicePage', () => {
  it('recalculates line totals and grand total as the user types', async () => {
    const { user } = renderPage();
    const qty = screen.getByLabelText('Qty, item 1');
    await user.clear(qty);
    await user.type(qty, '2');
    await user.type(screen.getByLabelText('Unit price (Rs.), item 1'), '1,500.50');

    expect(screen.getByTestId('line-total-0')).toHaveTextContent('Rs. 3,001.00');
    expect(screen.getByTestId('form-total')).toHaveTextContent('Rs. 3,001.00');
    expect(screen.getByTestId('preview-total')).toHaveTextContent('Rs. 3,001.00');
  });

  it('adds and removes items', async () => {
    const { user } = renderPage();
    expect(screen.getByRole('button', { name: 'Remove item 1' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: '+ Add item' }));
    expect(screen.getByLabelText('Item 2 description')).toHaveFocus();

    await user.type(screen.getByLabelText('Unit price (Rs.), item 1'), '100');
    await user.type(screen.getByLabelText('Unit price (Rs.), item 2'), '50');
    expect(screen.getByTestId('form-total')).toHaveTextContent('Rs. 150.00');

    await user.click(screen.getByRole('button', { name: 'Remove item 1' }));
    expect(screen.queryByLabelText('Item 2 description')).not.toBeInTheDocument();
    expect(screen.getByTestId('form-total')).toHaveTextContent('Rs. 50.00');
  });

  it('applies a percentage discount', async () => {
    const { user } = renderPage();
    await user.type(screen.getByLabelText('Unit price (Rs.), item 1'), '1000');
    await user.selectOptions(screen.getByLabelText('Discount type'), 'percentage');
    await user.type(screen.getByLabelText('Discount'), '12.5');

    expect(screen.getByTestId('form-discount')).toHaveTextContent('- Rs. 125.00');
    expect(screen.getByTestId('form-total')).toHaveTextContent('Rs. 875.00');
  });

  it('shows required-field errors and does not download an invalid invoice', async () => {
    const { user } = renderPage();
    await user.click(screen.getByRole('button', { name: 'Download PDF' }));

    expect(await screen.findByText('Business name is required')).toBeInTheDocument();
    expect(screen.getByText('Customer name is required')).toBeInTheDocument();
    expect(screen.getByText('Item description is required')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/fix the highlighted fields/i);
    expect(downloadMock).not.toHaveBeenCalled();
  });

  it('rejects a negative quantity', async () => {
    const { user } = renderPage();
    const qty = screen.getByLabelText('Qty, item 1');
    await user.clear(qty);
    await user.type(qty, '-3');
    await user.tab();
    expect(await screen.findByText(/Quantity must be a positive number/)).toBeInTheDocument();
  });

  it('downloads a valid invoice with a predictable file name', async () => {
    const { user } = renderPage();
    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: 'Download PDF' }));

    await waitFor(() => expect(downloadMock).toHaveBeenCalledTimes(1));
    const [view, fileName] = downloadMock.mock.calls[0]!;
    expect(fileName).toBe('INV-0001.pdf');
    expect(view).toMatchObject({ business: { name: 'Lanka Studio' }, total: 'Rs. 25,000.00' });
    expect(await screen.findByText(/attach the file/i)).toBeInTheDocument();
  });

  it('shows a clear error when PDF generation fails', async () => {
    downloadMock.mockRejectedValueOnce(new Error('boom'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { user } = renderPage();
    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: 'Download PDF' }));
    expect(await screen.findByText(/PDF could not be created/i)).toBeInTheDocument();
  });

  it('asks for confirmation before clearing the form', async () => {
    const { user } = renderPage();
    const businessName = screen.getByLabelText(/^Business name/);
    await user.type(businessName, 'Lanka Studio');

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    const dialog = screen.getByRole('alertdialog', { name: 'Clear this invoice?' });
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(businessName).toHaveValue('Lanka Studio');

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    await user.click(screen.getByRole('button', { name: 'Clear invoice' }));
    expect(screen.getByLabelText(/^Business name/)).toHaveValue('');
  });

  it('warns before navigating away with unsaved changes', async () => {
    const { user, router } = renderPage();
    await user.type(screen.getByLabelText(/^Business name/), 'Lanka Studio');

    await router.navigate('/');
    const dialog = await screen.findByRole('alertdialog', { name: 'Leave this page?' });
    await user.click(within(dialog).getByRole('button', { name: 'Stay' }));
    expect(router.state.location.pathname).toBe('/create');
  });

  it('switches between edit and preview tabs', async () => {
    const { user } = renderPage();
    await user.click(screen.getByRole('tab', { name: 'Preview' }));
    expect(screen.getByRole('tab', { name: 'Preview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('article', { name: 'Invoice preview' })).toBeInTheDocument();
  });
});
