import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { PermissionCodes } from '../../core/constants/permission-codes';

/**
 * Settings feature routes.
 */
export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/settings-hub/settings-hub.component').then((m) => m.SettingsHubComponent)
  },
  {
    path: 'tenant',
    loadComponent: () =>
      import('../tenant/pages/tenant-profile/tenant-profile.component').then(
        (m) => m.TenantProfileComponent
      )
  },
  {
    path: 'tenant-settings',
    loadComponent: () =>
      import('../tenant/pages/tenant-settings/tenant-settings.component').then(
        (m) => m.TenantSettingsComponent
      )
  },
  {
    path: 'branches',
    loadComponent: () =>
      import('../branch/pages/branch-list/branch-list.component').then((m) => m.BranchListComponent)
  },
  {
    path: 'branches/new',
    loadComponent: () =>
      import('../branch/pages/branch-form/branch-form.component').then((m) => m.BranchFormComponent)
  },
  {
    path: 'branches/:branchId/edit',
    loadComponent: () =>
      import('../branch/pages/branch-form/branch-form.component').then((m) => m.BranchFormComponent)
  },
  {
    path: 'modules',
    loadComponent: () =>
      import('../modules/pages/tenant-modules/tenant-modules.component').then(
        (m) => m.TenantModulesComponent
      )
  },
  {
    path: 'features',
    loadComponent: () =>
      import('../features/pages/tenant-features/tenant-features.component').then(
        (m) => m.TenantFeaturesComponent
      )
  },
  {
    path: 'notification-templates',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.NotificationTemplateView },
    loadComponent: () =>
      import('../notifications/pages/notification-template-list/notification-template-list.component').then(
        (m) => m.NotificationTemplateListComponent
      )
  },
  {
    path: 'notification-templates/new',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.NotificationTemplateManage },
    loadComponent: () =>
      import('../notifications/pages/notification-template-form/notification-template-form.component').then(
        (m) => m.NotificationTemplateFormComponent
      )
  },
  {
    path: 'notification-templates/:templateId/edit',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.NotificationTemplateView },
    loadComponent: () =>
      import('../notifications/pages/notification-template-form/notification-template-form.component').then(
        (m) => m.NotificationTemplateFormComponent
      )
  }
];
