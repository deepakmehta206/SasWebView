import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { PermissionCodes } from './core/constants/permission-codes';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      )
  },
  {
    path: 'reset-password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      )
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES)
      },
      {
        path: 'settings',
        canActivate: [permissionGuard],
        data: {
          anyPermissions: [
            PermissionCodes.TenantView,
            PermissionCodes.SettingsView,
            PermissionCodes.NotificationTemplateView,
            PermissionCodes.FileView,
            PermissionCodes.AuditView
          ]
        },
        loadChildren: () =>
          import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES)
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.USERS_ROUTES)
      },
      {
        path: 'roles',
        loadChildren: () =>
          import('./features/roles/roles.routes').then((m) => m.ROLES_ROUTES)
      },
      {
        path: 'modules',
        loadChildren: () =>
          import('./features/modules/modules.routes').then((m) => m.MODULES_ROUTES)
      },
      {
        path: 'features',
        loadChildren: () =>
          import('./features/features/features.routes').then((m) => m.FEATURES_ROUTES)
      },
      {
        path: 'subscription',
        loadChildren: () =>
          import('./features/subscription/subscription.routes').then((m) => m.SUBSCRIPTION_ROUTES)
      },
      {
        path: 'masters',
        loadChildren: () =>
          import('./features/masters/masters.routes').then((m) => m.MASTERS_ROUTES)
      },
      {
        path: 'hrms',
        loadChildren: () => import('./features/hrms/hrms.routes').then((m) => m.HRMS_ROUTES)
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('./features/notifications/notifications.routes').then((m) => m.NOTIFICATIONS_ROUTES)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/auth/pages/profile/profile.component').then((m) => m.ProfileComponent)
      },
      {
        path: 'change-password',
        loadComponent: () =>
          import('./features/auth/pages/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent
          )
      },
      {
        path: '403',
        loadComponent: () =>
          import('./features/forbidden/forbidden.component').then((m) => m.ForbiddenComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
