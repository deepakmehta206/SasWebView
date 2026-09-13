import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { PermissionCodes } from '../../core/constants/permission-codes';

const masterKeys = [
  'countries',
  'states',
  'cities',
  'currencies',
  'payment-modes',
  'document-types',
  'units-of-measure'
] as const;

function masterRoutes(masterKey: (typeof masterKeys)[number]): Routes {
  return [
    {
      path: masterKey,
      canActivate: [permissionGuard],
      data: { permission: PermissionCodes.MasterView, masterKey },
      loadComponent: () =>
        import('./pages/master-list/master-list.component').then((m) => m.MasterListComponent)
    },
    {
      path: `${masterKey}/new`,
      canActivate: [permissionGuard],
      data: { permission: PermissionCodes.MasterEdit, masterKey },
      loadComponent: () =>
        import('./pages/master-form/master-form.component').then((m) => m.MasterFormComponent)
    },
    {
      path: `${masterKey}/:id/edit`,
      canActivate: [permissionGuard],
      data: { permission: PermissionCodes.MasterEdit, masterKey },
      loadComponent: () =>
        import('./pages/master-form/master-form.component').then((m) => m.MasterFormComponent)
    }
  ];
}

export const MASTERS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [permissionGuard],
    data: { permission: PermissionCodes.MasterView },
    loadComponent: () =>
      import('./pages/masters-hub/masters-hub.component').then((m) => m.MastersHubComponent)
  },
  ...masterKeys.flatMap((key) => masterRoutes(key))
];
