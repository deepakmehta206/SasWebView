import { Routes } from '@angular/router';
import { featureGuard } from '../../core/guards/feature.guard';
import { permissionGuard } from '../../core/guards/permission.guard';
import { FeatureCodes, ModuleCodes } from '../../core/constants/feature-codes';
import { PermissionCodes } from '../../core/constants/permission-codes';

const billingInvoice = {
  moduleCode: ModuleCodes.Billing,
  featureCode: FeatureCodes.BillingInvoice
};

const billingPayment = {
  moduleCode: ModuleCodes.Billing,
  featureCode: FeatureCodes.BillingPayment
};

/** Billing routes — feature + permission gated. */
export const BILLING_ROUTES: Routes = [
  {
    path: '',
    canActivate: [featureGuard, permissionGuard],
    data: {
      moduleCode: ModuleCodes.Billing,
      anyPermissions: [PermissionCodes.BillingView]
    },
    loadComponent: () =>
      import('./pages/billing-hub/billing-hub.component').then((m) => m.BillingHubComponent)
  },
  {
    path: 'customers',
    canActivate: [featureGuard, permissionGuard],
    data: { ...billingInvoice, permission: PermissionCodes.BillingView },
    loadComponent: () =>
      import('./pages/customers/customers-list.component').then((m) => m.CustomersListComponent)
  },
  {
    path: 'customers/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...billingInvoice, permission: PermissionCodes.BillingCustomerManage },
    loadComponent: () =>
      import('./pages/customers/customers-form.component').then((m) => m.CustomersFormComponent)
  },
  {
    path: 'customers/:id/edit',
    canActivate: [featureGuard, permissionGuard],
    data: { ...billingInvoice, permission: PermissionCodes.BillingCustomerManage },
    loadComponent: () =>
      import('./pages/customers/customers-form.component').then((m) => m.CustomersFormComponent)
  },
  {
    path: 'invoices',
    canActivate: [featureGuard, permissionGuard],
    data: { ...billingInvoice, permission: PermissionCodes.BillingView },
    loadComponent: () =>
      import('./pages/invoices/invoices-list.component').then((m) => m.InvoicesListComponent)
  },
  {
    path: 'invoices/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...billingInvoice, permission: PermissionCodes.BillingInvoiceManage },
    loadComponent: () =>
      import('./pages/invoices/invoices-form.component').then((m) => m.InvoicesFormComponent)
  },
  {
    path: 'invoices/:id/edit',
    canActivate: [featureGuard, permissionGuard],
    data: { ...billingInvoice, permission: PermissionCodes.BillingInvoiceManage },
    loadComponent: () =>
      import('./pages/invoices/invoices-form.component').then((m) => m.InvoicesFormComponent)
  },
  {
    path: 'invoices/:id',
    canActivate: [featureGuard, permissionGuard],
    data: { ...billingInvoice, permission: PermissionCodes.BillingView },
    loadComponent: () =>
      import('./pages/invoices/invoices-detail.component').then((m) => m.InvoicesDetailComponent)
  },
  {
    path: 'payments',
    canActivate: [featureGuard, permissionGuard],
    data: { ...billingPayment, permission: PermissionCodes.BillingView },
    loadComponent: () =>
      import('./pages/payments/payments-list.component').then((m) => m.PaymentsListComponent)
  }
];
