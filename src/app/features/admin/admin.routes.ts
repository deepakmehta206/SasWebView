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
    path: 'tenants/:id/edit',
    canActivate: [platformAdminGuard],
    loadComponent: () =>
      import('./pages/tenant-edit/tenant-edit.component').then((m) => m.TenantEditComponent)
  },
  {
    path: 'tenants/:id/users/new',
    canActivate: [platformAdminGuard],
    loadComponent: () =>
      import('./pages/tenant-user-form/admin-tenant-user-form.component').then(
        (m) => m.AdminTenantUserFormComponent
      )
  },
  {
    path: 'tenants/:id/users/:userId/edit',
    canActivate: [platformAdminGuard],
    loadComponent: () =>
      import('./pages/tenant-user-form/admin-tenant-user-form.component').then(
        (m) => m.AdminTenantUserFormComponent
      )
  },
  {
    path: 'tenants/:id/users/:userId/roles',
    canActivate: [platformAdminGuard],
    loadComponent: () =>
      import('./pages/tenant-user-roles/admin-tenant-user-roles.component').then(
        (m) => m.AdminTenantUserRolesComponent
      )
  },
  {
    path: 'tenants/:id/users/:userId',
    canActivate: [platformAdminGuard],
    loadComponent: () =>
      import('./pages/tenant-user-detail/admin-tenant-user-detail.component').then(
        (m) => m.AdminTenantUserDetailComponent
      )
  },
  {
    path: 'tenants/:id/users',
    canActivate: [platformAdminGuard],
    loadComponent: () =>
      import('./pages/tenant-users-list/admin-tenant-users-list.component').then(
        (m) => m.AdminTenantUsersListComponent
      )
  },
  {
    path: 'tenants/:id/roles/new',
    canActivate: [platformAdminGuard],
    loadComponent: () =>
      import('./pages/tenant-role-form/admin-tenant-role-form.component').then(
        (m) => m.AdminTenantRoleFormComponent
      )
  },
  {
    path: 'tenants/:id/roles/:roleId/edit',
    canActivate: [platformAdminGuard],
    loadComponent: () =>
      import('./pages/tenant-role-form/admin-tenant-role-form.component').then(
        (m) => m.AdminTenantRoleFormComponent
      )
  },
  {
    path: 'tenants/:id/roles/:roleId/permissions',
    canActivate: [platformAdminGuard],
    loadComponent: () =>
      import('./pages/tenant-role-permissions/admin-tenant-role-permissions.component').then(
        (m) => m.AdminTenantRolePermissionsComponent
      )
  },
  {
    path: 'tenants/:id/roles',
    canActivate: [platformAdminGuard],
    loadComponent: () =>
      import('./pages/tenant-roles-list/admin-tenant-roles-list.component').then(
        (m) => m.AdminTenantRolesListComponent
      )
  },
  {
    path: 'tenants/:id',
    canActivate: [platformAdminGuard],
    loadComponent: () =>
      import('./pages/tenant-detail/tenant-detail.component').then((m) => m.TenantDetailComponent)
  },
  {
    path: 'audit',
    canActivate: [platformAdminGuard],
    loadComponent: () =>
      import('./pages/audit/admin-audit.component').then((m) => m.AdminAuditComponent)
  }
];
