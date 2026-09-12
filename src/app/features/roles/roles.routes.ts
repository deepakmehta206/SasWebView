import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { PermissionCodes } from '../../core/constants/permission-codes';

export const ROLES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.RoleView },
    loadComponent: () =>
      import('./pages/role-list/role-list.component').then((m) => m.RoleListComponent)
  },
  {
    path: 'new',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.RoleAdd },
    loadComponent: () =>
      import('./pages/role-form/role-form.component').then((m) => m.RoleFormComponent)
  },
  {
    path: ':roleId/edit',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.RoleEdit },
    loadComponent: () =>
      import('./pages/role-form/role-form.component').then((m) => m.RoleFormComponent)
  },
  {
    path: ':roleId/permissions',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.RoleEdit },
    loadComponent: () =>
      import('./pages/role-permissions/role-permissions.component').then(
        (m) => m.RolePermissionsComponent
      )
  }
];
