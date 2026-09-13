/**
 * Module/feature codes matching SaaSPlatform.Domain.Constants.ModuleFeatureCodes.
 * Used with FeatureAccessService — do not invent codes.
 */
export const ModuleCodes = {
  Hrms: 'HRMS',
  Inventory: 'INVENTORY'
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
  InventoryPurchase: 'INVENTORY_PURCHASE'
} as const;
