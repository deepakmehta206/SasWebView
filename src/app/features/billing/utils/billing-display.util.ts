import {
  BillingCustomerTypes,
  BillingInvoiceStatuses,
  BillingPaymentStatuses
} from '../models/billing.models';

export function customerTypeLabel(value: string): string {
  switch (value) {
    case BillingCustomerTypes.Individual:
      return 'Individual';
    case BillingCustomerTypes.Business:
      return 'Business';
    default:
      return value || '—';
  }
}

export function invoiceStatusLabel(value: string): string {
  switch (value) {
    case BillingInvoiceStatuses.Draft:
      return 'Draft';
    case BillingInvoiceStatuses.Approved:
      return 'Approved';
    case BillingInvoiceStatuses.PartiallyPaid:
      return 'Partially paid';
    case BillingInvoiceStatuses.Paid:
      return 'Paid';
    case BillingInvoiceStatuses.Cancelled:
      return 'Cancelled';
    default:
      return value || '—';
  }
}

export function invoiceStatusClass(value: string): string {
  switch (value) {
    case BillingInvoiceStatuses.Draft:
      return 'status-pill--muted';
    case BillingInvoiceStatuses.Approved:
      return 'status-pill--accent';
    case BillingInvoiceStatuses.PartiallyPaid:
      return 'status-pill--warning';
    case BillingInvoiceStatuses.Paid:
      return 'status-pill--success';
    case BillingInvoiceStatuses.Cancelled:
      return 'status-pill--danger';
    default:
      return '';
  }
}

export function paymentStatusLabel(value: string): string {
  switch (value) {
    case BillingPaymentStatuses.Posted:
      return 'Posted';
    case BillingPaymentStatuses.Cancelled:
      return 'Cancelled';
    default:
      return value || '—';
  }
}

export function paymentStatusClass(value: string): string {
  switch (value) {
    case BillingPaymentStatuses.Posted:
      return 'status-pill--success';
    case BillingPaymentStatuses.Cancelled:
      return 'status-pill--danger';
    default:
      return '';
  }
}

export function draftInvoiceNumberLabel(invoiceNumber: string | null | undefined): string {
  if (invoiceNumber?.trim()) {
    return invoiceNumber.trim();
  }
  return 'Not assigned';
}

export function formatOutstanding(
  outstandingAmount: number | null | undefined,
  totalAmount?: number,
  paidAmount?: number
): number {
  if (outstandingAmount !== null && outstandingAmount !== undefined && !Number.isNaN(Number(outstandingAmount))) {
    return Number(outstandingAmount);
  }
  return Number(totalAmount ?? 0) - Number(paidAmount ?? 0);
}

export function formatMoney(value: number | null | undefined, currencyCode?: string | null): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—';
  }
  const amount = Number(value);
  if (currencyCode?.trim()) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currencyCode.trim(),
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch {
      // fall through
    }
  }
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/** UX-only line preview. Backend remains authoritative. */
export function previewLineTotals(
  quantity: number,
  unitPrice: number,
  discountPercent: number,
  taxPercent: number
): { gross: number; discount: number; taxable: number; tax: number; lineTotal: number } {
  const gross = roundMoney(quantity * unitPrice);
  const discount = roundMoney((gross * discountPercent) / 100);
  const taxable = roundMoney(gross - discount);
  const tax = roundMoney((taxable * taxPercent) / 100);
  const lineTotal = roundMoney(taxable + tax);
  return { gross, discount, taxable, tax, lineTotal };
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export interface BillingInvoiceActionAvailability {
  canEdit: boolean;
  canApprove: boolean;
  canCancel: boolean;
  canPay: boolean;
}

/** UI-only. Permissions checked separately. Matches Phase 11A cancel rules. */
export function getInvoiceActions(status: string): BillingInvoiceActionAvailability {
  const normalized = (status || '').toUpperCase();
  return {
    canEdit: normalized === BillingInvoiceStatuses.Draft,
    canApprove: normalized === BillingInvoiceStatuses.Draft,
    canCancel:
      normalized === BillingInvoiceStatuses.Draft ||
      normalized === BillingInvoiceStatuses.Approved,
    canPay:
      normalized === BillingInvoiceStatuses.Approved ||
      normalized === BillingInvoiceStatuses.PartiallyPaid
  };
}
