import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStateService } from '../auth/auth-state.service';

/**
 * UX-only platform-admin route check.
 * Backend PLATFORM_ADMIN / IsPlatformAdmin remains the security boundary.
 */
export const platformAdminGuard: CanActivateFn = (_route, state) => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  if (!authState.isAuthenticated()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  if (authState.currentUser()?.isPlatformAdmin === true) {
    return true;
  }

  return router.createUrlTree(['/403']);
};
