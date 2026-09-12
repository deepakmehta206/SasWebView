import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationService } from '../constants/nav.config';
import { FeatureAccessService } from './feature-access.service';

/**
 * Reloads effective feature access (entitlements primary, /me/features fallback)
 * and redirects away from routes belonging to disabled modules/features.
 * Does not logout.
 */
@Injectable({ providedIn: 'root' })
export class FeatureAccessCoordinator {
  private readonly featureAccess = inject(FeatureAccessService);
  private readonly navigation = inject(NavigationService);
  private readonly router = inject(Router);

  reloadAndGuardCurrentRoute(): void {
    const currentUrl = this.router.url;

    this.featureAccess.reload().subscribe({
      next: () => this.redirectIfCurrentRouteBlocked(currentUrl),
      error: () => undefined
    });
  }

  private redirectIfCurrentRouteBlocked(currentUrl: string): void {
    const path = currentUrl.split('?')[0];

    for (const module of this.featureAccess.modules()) {
      if (module.enabled) {
        continue;
      }

      const prefixes = this.navigation.getRoutePrefixesForModule(module.code);
      if (prefixes.some((prefix) => path === prefix || path.startsWith(prefix + '/'))) {
        void this.router.navigateByUrl('/dashboard');
        return;
      }
    }

    for (const module of this.featureAccess.modules()) {
      for (const feature of module.features ?? []) {
        if (feature.enabled) {
          continue;
        }
        const prefixes = this.navigation.getRoutePrefixesForFeature(feature.code);
        if (prefixes.some((prefix) => path === prefix || path.startsWith(prefix + '/'))) {
          void this.router.navigateByUrl('/dashboard');
          return;
        }
      }
    }
  }
}
