import {
  customerTypeLabel,
  draftInvoiceNumberLabel,
  formatOutstanding,
  getInvoiceActions,
  invoiceStatusLabel,
  paymentStatusLabel,
  previewLineTotals
} from './billing-display.util';

describe('billing-display.util', () => {
  it('labels customer types and statuses', () => {
    expect(customerTypeLabel('INDIVIDUAL')).toBe('Individual');
    expect(invoiceStatusLabel('DRAFT')).toBe('Draft');
    expect(paymentStatusLabel('POSTED')).toBe('Posted');
  });

  it('shows Not assigned for draft invoice numbers', () => {
    expect(draftInvoiceNumberLabel(null)).toBe('Not assigned');
    expect(draftInvoiceNumberLabel('')).toBe('Not assigned');
    expect(draftInvoiceNumberLabel('INV-RNC-2026-000001')).toBe('INV-RNC-2026-000001');
  });

  it('formats outstanding preferring API value', () => {
    expect(formatOutstanding(25, 100, 70)).toBe(25);
    expect(formatOutstanding(null, 100, 40)).toBe(60);
  });

  it('returns invoice action availability by status', () => {
    expect(getInvoiceActions('DRAFT')).toEqual({
      canEdit: true,
      canApprove: true,
      canCancel: true,
      canPay: false
    });
    expect(getInvoiceActions('APPROVED').canPay).toBeTrue();
    expect(getInvoiceActions('PARTIALLY_PAID').canCancel).toBeFalse();
    expect(getInvoiceActions('PAID').canPay).toBeFalse();
    expect(getInvoiceActions('CANCELLED').canEdit).toBeFalse();
  });

  it('previews line totals for UX only', () => {
    const preview = previewLineTotals(2, 100, 10, 18);
    expect(preview.gross).toBe(200);
    expect(preview.discount).toBe(20);
    expect(preview.taxable).toBe(180);
    expect(preview.tax).toBe(32.4);
    expect(preview.lineTotal).toBe(212.4);
  });
});
