/**
 * Permission codes matching SaaSPlatform.Domain.Constants.PermissionCodes.
 * Frontend checks are UX-only — backend remains authoritative.
 */
export const PermissionCodes = {
  UserView: 'USER_VIEW',
  UserAdd: 'USER_ADD',
  UserEdit: 'USER_EDIT',
  UserDelete: 'USER_DELETE',

  RoleView: 'ROLE_VIEW',
  RoleAdd: 'ROLE_ADD',
  RoleEdit: 'ROLE_EDIT',
  RoleDelete: 'ROLE_DELETE',

  SettingsView: 'SETTINGS_VIEW',
  SettingsEdit: 'SETTINGS_EDIT',

  TenantView: 'TENANT_VIEW',
  TenantAdd: 'TENANT_ADD',
  TenantEdit: 'TENANT_EDIT',

  ModuleView: 'MODULE_VIEW',
  ModuleAdd: 'MODULE_ADD',
  ModuleEdit: 'MODULE_EDIT',

  FeatureView: 'FEATURE_VIEW',
  FeatureAdd: 'FEATURE_ADD',
  FeatureEdit: 'FEATURE_EDIT',

  TenantModuleEdit: 'TENANT_MODULE_EDIT',
  TenantFeatureEdit: 'TENANT_FEATURE_EDIT',

  PlanView: 'PLAN_VIEW',
  PlanManage: 'PLAN_MANAGE',

  SubscriptionView: 'SUBSCRIPTION_VIEW',
  SubscriptionManage: 'SUBSCRIPTION_MANAGE',

  MasterView: 'MASTER_VIEW',
  MasterEdit: 'MASTER_EDIT',

  EmployeeView: 'EMPLOYEE_VIEW',
  EmployeeAdd: 'EMPLOYEE_ADD',
  EmployeeEdit: 'EMPLOYEE_EDIT',
  EmployeeDelete: 'EMPLOYEE_DELETE',
  EmployeeProfileSensitive: 'EMPLOYEE_PROFILE_SENSITIVE',

  AttendanceView: 'ATTENDANCE_VIEW',
  AttendanceAdd: 'ATTENDANCE_ADD',
  AttendanceEdit: 'ATTENDANCE_EDIT',

  LeaveView: 'LEAVE_VIEW',
  LeaveApply: 'LEAVE_APPLY',
  LeaveApprove: 'LEAVE_APPROVE',
  LeaveReject: 'LEAVE_REJECT',

  PayrollView: 'PAYROLL_VIEW',
  PayrollProcess: 'PAYROLL_PROCESS',
  PayrollApprove: 'PAYROLL_APPROVE',
  PayrollLock: 'PAYROLL_LOCK',
  PayslipView: 'PAYSLIP_VIEW',

  NotificationView: 'NOTIFICATION_VIEW',
  NotificationManage: 'NOTIFICATION_MANAGE',
  NotificationTemplateView: 'NOTIFICATION_TEMPLATE_VIEW',
  NotificationTemplateManage: 'NOTIFICATION_TEMPLATE_MANAGE',
  NotificationPreferenceEdit: 'NOTIFICATION_PREFERENCE_EDIT',

  FileView: 'FILE_VIEW',
  FileUpload: 'FILE_UPLOAD',
  FileDelete: 'FILE_DELETE',

  AuditView: 'AUDIT_VIEW',

  InventoryView: 'INVENTORY_VIEW',
  InventoryItemManage: 'INVENTORY_ITEM_MANAGE',
  InventorySupplierManage: 'INVENTORY_SUPPLIER_MANAGE',
  InventoryWarehouseManage: 'INVENTORY_WAREHOUSE_MANAGE',
  InventoryStockAdjust: 'INVENTORY_STOCK_ADJUST',
  InventoryStockTransfer: 'INVENTORY_STOCK_TRANSFER',
  InventoryPurchaseManage: 'INVENTORY_PURCHASE_MANAGE',
  InventoryPurchaseApprove: 'INVENTORY_PURCHASE_APPROVE',
  InventoryReceiptCreate: 'INVENTORY_RECEIPT_CREATE',

  BillingView: 'BILLING_VIEW',
  BillingCustomerManage: 'BILLING_CUSTOMER_MANAGE',
  BillingInvoiceManage: 'BILLING_INVOICE_MANAGE',
  BillingInvoiceApprove: 'BILLING_INVOICE_APPROVE',
  BillingInvoiceCancel: 'BILLING_INVOICE_CANCEL',
  BillingPaymentManage: 'BILLING_PAYMENT_MANAGE'
} as const;

export type PermissionCode = (typeof PermissionCodes)[keyof typeof PermissionCodes];
