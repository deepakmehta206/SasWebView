import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { PermissionCodes } from '../../core/constants/permission-codes';

export const NOTIFICATIONS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.NotificationView },
    loadComponent: () =>
      import('./pages/notification-list/notification-list.component').then(
        (m) => m.NotificationListComponent
      )
  },
  {
    path: 'preferences',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.NotificationView },
    loadComponent: () =>
      import('./pages/notification-preferences/notification-preferences.component').then(
        (m) => m.NotificationPreferencesComponent
      )
  },
  {
    path: ':id',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.NotificationView },
    loadComponent: () =>
      import('./pages/notification-detail/notification-detail.component').then(
        (m) => m.NotificationDetailComponent
      )
  }
];
