import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { PermissionCodes } from '../../core/constants/permission-codes';

export const FEATURES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.FeatureView },
    loadComponent: () =>
      import('./pages/feature-list/feature-list.component').then((m) => m.FeatureListComponent)
  },
  {
    path: 'new',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.FeatureAdd },
    loadComponent: () =>
      import('./pages/feature-form/feature-form.component').then((m) => m.FeatureFormComponent)
  },
  {
    path: ':featureId/edit',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.FeatureEdit },
    loadComponent: () =>
      import('./pages/feature-form/feature-form.component').then((m) => m.FeatureFormComponent)
  }
];
