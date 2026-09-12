import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { PermissionCodes } from '../../core/constants/permission-codes';

export const MODULES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.ModuleView },
    loadComponent: () =>
      import('./pages/module-list/module-list.component').then((m) => m.ModuleListComponent)
  },
  {
    path: 'new',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.ModuleAdd },
    loadComponent: () =>
      import('./pages/module-form/module-form.component').then((m) => m.ModuleFormComponent)
  },
  {
    path: ':moduleId',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.ModuleView },
    loadComponent: () =>
      import('./pages/module-details/module-details.component').then((m) => m.ModuleDetailsComponent)
  },
  {
    path: ':moduleId/edit',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.ModuleEdit },
    loadComponent: () =>
      import('./pages/module-form/module-form.component').then((m) => m.ModuleFormComponent)
  }
];
