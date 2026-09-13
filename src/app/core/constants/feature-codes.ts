/**
 * Module/feature codes matching SaaSPlatform.Domain.Constants.ModuleFeatureCodes.
 * Used with FeatureAccessService — do not invent codes.
 */
export const ModuleCodes = {
  Hrms: 'HRMS',
  Inventory: 'INVENTORY',
  Billing: 'BILLING'
} as const;

export const FeatureCodes = {
  HrmsEmployee: 'HRMS_EMPLOYEE',
  HrmsAttendance: 'HRMS_ATTENDANCE',
  HrmsShift: 'HRMS_SHIFT',
  HrmsLeave: 'HRMS_LEAVE',
  HrmsOvertime: 'HRMS_OVERTIME',
  HrmsPayroll: 'HRMS_PAYROLL',

  InventoryItem: 'INVENTORY_ITEM',
  InventoryStock: 'INVENTORY_STOCK',
  InventoryPurchase: 'INVENTORY_PURCHASE',

  BillingInvoice: 'BILLING_INVOICE',
  BillingPayment: 'BILLING_PAYMENT',
  /** Cataloged for future credit notes/refunds — not used in Phase 11B UI. */
  BillingRefund: 'BILLING_REFUND'
} as const;
