/** Phase 11B Billing models — mirror Phase 11A BillingDtos JSON exactly. */

export const BillingCustomerTypes = {
  Individual: 'INDIVIDUAL',
  Business: 'BUSINESS'
} as const;

export const BillingInvoiceStatuses = {
  Draft: 'DRAFT',
  Approved: 'APPROVED',
  PartiallyPaid: 'PARTIALLY_PAID',
  Paid: 'PAID',
  Cancelled: 'CANCELLED'
} as const;

export const BillingPaymentStatuses = {
  Posted: 'POSTED',
  Cancelled: 'CANCELLED'
} as const;

export type BillingCustomerType =
  (typeof BillingCustomerTypes)[keyof typeof BillingCustomerTypes];
export type BillingInvoiceStatus =
  (typeof BillingInvoiceStatuses)[keyof typeof BillingInvoiceStatuses];
export type BillingPaymentStatus =
  (typeof BillingPaymentStatuses)[keyof typeof BillingPaymentStatuses];

export interface BillingCustomer {
  customerId: number;
  tenantId: number;
  branchId: number | null;
  customerCode: string;
  customerName: string;
  customerType: string;
  email: string | null;
  phone: string | null;
  taxNumber: string | null;
  billingAddress: string | null;
  paymentTerms: string | null;
  creditLimit: number;
  currencyCode: string | null;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string | null;
}

export interface CreateBillingCustomerRequest {
  branchId: number | null;
  customerCode: string;
  customerName: string;
  customerType: string;
  email: string | null;
  phone: string | null;
  taxNumber: string | null;
  billingAddress: string | null;
  paymentTerms: string | null;
  creditLimit: number;
  currencyCode: string | null;
}

export interface UpdateBillingCustomerRequest extends CreateBillingCustomerRequest {
  isActive: boolean;
}

export interface SetBillingCustomerStatusRequest {
  isActive: boolean;
}

export interface BillingInvoiceLine {
  invoiceLineId: number;
  invoiceId: number;
  tenantId: number;
  lineNumber: number;
  itemId: number | null;
  itemCode: string | null;
  itemName: string | null;
  description: string;
  uomCode: string | null;
  uomName: string | null;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
  grossAmount: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  lineTotal: number;
}

export interface BillingInvoice {
  invoiceId: number;
  tenantId: number;
  branchId: number;
  customerId: number;
  invoiceNumber: string | null;
  invoiceDate: string;
  dueDate: string | null;
  status: string;
  currencyCode: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  notes: string | null;
  createdDate: string;
  modifiedDate: string | null;
  lines: BillingInvoiceLine[];
}

export interface BillingInvoiceLineRequest {
  itemId: number | null;
  description: string | null;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
}

export interface CreateBillingInvoiceRequest {
  branchId: number;
  customerId: number;
  invoiceDate: string;
  dueDate: string | null;
  currencyCode: string;
  notes: string | null;
  lines: BillingInvoiceLineRequest[];
}

export interface UpdateBillingInvoiceRequest {
  branchId: number;
  customerId: number;
  invoiceDate: string;
  dueDate: string | null;
  currencyCode: string;
  notes: string | null;
  lines: BillingInvoiceLineRequest[];
}

export interface BillingPayment {
  paymentId: number;
  tenantId: number;
  branchId: number;
  invoiceId: number;
  paymentDate: string;
  amount: number;
  paymentModeId: number;
  referenceNumber: string | null;
  status: string;
  notes: string | null;
  createdDate: string;
  modifiedDate: string | null;
}

export interface PostBillingPaymentRequest {
  invoiceId: number;
  paymentDate: string;
  amount: number;
  paymentModeId: number;
  referenceNumber: string | null;
  notes: string | null;
}

export interface BillingCustomerListQuery {
  isActive?: boolean | null;
  branchId?: number | null;
}

export interface BillingInvoiceListQuery {
  customerId?: number | null;
  status?: string | null;
  branchId?: number | null;
  fromDate?: string | null;
  toDate?: string | null;
}

export interface BillingPaymentListQuery {
  invoiceId?: number | null;
  fromDate?: string | null;
  toDate?: string | null;
}
