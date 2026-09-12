import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../permissions/permission.service';

/**
 * Route data:
 * - permission: string
 * - anyPermissions: string[]
 * - allPermissions: string[]
 *
 * UX-only — backend still enforces permissions.
 */
export const permissionGuard: CanActivateFn = (route) => {
  const permissions = inject(PermissionService);
  const router = inject(Router);

  const single = route.data['permission'] as string | undefined;
  const any = route.data['anyPermissions'] as string[] | undefined;
  const all = route.data['allPermissions'] as string[] | undefined;

  let allowed = true;

  if (single) {
    allowed = permissions.hasPermission(single);
  } else if (any?.length) {
    allowed = permissions.hasAnyPermission(any);
  } else if (all?.length) {
    allowed = permissions.hasAllPermissions(all);
  }

  if (allowed) {
    return true;
  }

  return router.createUrlTree(['/403']);
};
