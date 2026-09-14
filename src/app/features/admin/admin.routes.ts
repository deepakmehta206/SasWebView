import { Routes } from '@angular/router';
import { platformAdminGuard } from '../../core/guards/platform-admin.guard';

export const ADMIN_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tenants' },
  {
    path: 'tenants',
    canActivate: [platformAdminGuard],
    loadComponent: () =>
      import('./pages/tenants-list/tenants-list.component').then((m) => m.TenantsListComponent)
  },
  {
    path: 'tenants/new',
    canActivate: [platformAdminGuard],
    loadComponent: () =>
      import('./pages/tenant-provision/tenant-provision.component').then(
        (m) => m.TenantProvisionComponent
      )
  },
  {
    path: 'tenants/:id',
    canActivate: [platformAdminGuard],
    loadComponent: () =>
      import('./pages/tenant-detail/tenant-detail.component').then((m) => m.TenantDetailComponent)
  },
  {
    path: 'tenants/:id/edit',
    canActivate: [platformAdminGuard],
    loadComponent: () =>
      import('./pages/tenant-edit/tenant-edit.component').then((m) => m.TenantEditComponent)
  },
  {
    path: 'audit',
    canActivate: [platformAdminGuard],
    loadComponent: () =>
      import('./pages/audit/admin-audit.component').then((m) => m.AdminAuditComponent)
  }
];
