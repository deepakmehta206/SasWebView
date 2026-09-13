import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FeatureAccessService } from '../entitlements/feature-access.service';

/**
 * Route data:
 * - moduleCode?: string
 * - featureCode?: string
 *
 * UX-only — backend RequireFeature remains authoritative.
 */
export const featureGuard: CanActivateFn = (route) => {
  const featureAccess = inject(FeatureAccessService);
  const router = inject(Router);

  const moduleCode = route.data['moduleCode'] as string | undefined;
  const featureCode = route.data['featureCode'] as string | undefined;

  if (moduleCode && !featureAccess.isModuleEnabled(moduleCode)) {
    return router.createUrlTree(['/403']);
  }

  if (featureCode && !featureAccess.isFeatureEnabled(featureCode)) {
    return router.createUrlTree(['/403']);
  }

  return true;
};
