import { Routes } from '@angular/router';

/**
 * Settings feature routes.
 * Structure is guard-ready; authorization guards will be added in Phase 3+.
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
  }
];
