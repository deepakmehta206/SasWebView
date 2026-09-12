import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { PermissionCodes } from '../../core/constants/permission-codes';

export const SUBSCRIPTION_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard],
    data: { anyPermissions: [PermissionCodes.SubscriptionView] },
    loadComponent: () =>
      import('./pages/subscription-hub/subscription-hub.component').then(
        (m) => m.SubscriptionHubComponent
      )
  },
  {
    path: 'plans',
    canActivate: [permissionGuard],
    data: { anyPermissions: [PermissionCodes.PlanView] },
    loadComponent: () =>
      import('./pages/plan-catalog/plan-catalog.component').then((m) => m.PlanCatalogComponent)
  },
  {
    path: 'usage',
    canActivate: [permissionGuard],
    data: { anyPermissions: [PermissionCodes.SubscriptionView] },
    loadComponent: () =>
      import('./pages/subscription-usage/subscription-usage.component').then(
        (m) => m.SubscriptionUsageComponent
      )
  },
  {
    path: 'invoices',
    canActivate: [permissionGuard],
    data: { anyPermissions: [PermissionCodes.SubscriptionView] },
    loadComponent: () =>
      import('./pages/invoice-list/invoice-list.component').then((m) => m.InvoiceListComponent)
  },
  {
    path: 'invoices/:id',
    canActivate: [permissionGuard],
    data: { anyPermissions: [PermissionCodes.SubscriptionView] },
    loadComponent: () =>
      import('./pages/invoice-detail/invoice-detail.component').then((m) => m.InvoiceDetailComponent)
  }
];
