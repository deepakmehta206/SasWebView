import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { PermissionCodes } from '../../core/constants/permission-codes';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.UserView },
    loadComponent: () =>
      import('./pages/user-list/user-list.component').then((m) => m.UserListComponent)
  },
  {
    path: 'new',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.UserAdd },
    loadComponent: () =>
      import('./pages/user-form/user-form.component').then((m) => m.UserFormComponent)
  },
  {
    path: ':userId',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.UserView },
    loadComponent: () =>
      import('./pages/user-details/user-details.component').then((m) => m.UserDetailsComponent)
  },
  {
    path: ':userId/edit',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.UserEdit },
    loadComponent: () =>
      import('./pages/user-form/user-form.component').then((m) => m.UserFormComponent)
  }
];
