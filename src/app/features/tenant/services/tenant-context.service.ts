import { Injectable, computed, signal } from '@angular/core';

/**
 * Holds the current tenant id for UI route construction and feature services.
 * This is not a security boundary — the backend remains authoritative.
 *
 * When authenticated, TenantId MUST come from AuthState / JWT context.
 * Never silently fall back to a development default for authenticated users.
 */
@Injectable({ providedIn: 'root' })
export class TenantContextService {
  /**
   * Isolated unauthenticated development placeholder only.
   * Must never override an authenticated TenantId.
   */
  private static readonly UNAUTHENTICATED_DEV_PLACEHOLDER_TENANT_ID = 1001;

  private readonly tenantIdSignal = signal<number | null>(null);
  private readonly authenticatedSignal = signal(false);

  readonly tenantId = computed(() => {
    const value = this.tenantIdSignal();
    if (value != null && value > 0) {
      return value;
    }

    // Only when not authenticated — never used to override auth claims.
    if (!this.authenticatedSignal()) {
      return TenantContextService.UNAUTHENTICATED_DEV_PLACEHOLDER_TENANT_ID;
    }

    return 0;
  });

  readonly hasTenant = computed(() => this.tenantId() > 0);
  readonly isAuthenticatedTenant = this.authenticatedSignal.asReadonly();

  /**
   * Set tenant from authenticated user/JWT context.
   */
  setAuthenticatedTenantId(tenantId: number): void {
    if (!Number.isFinite(tenantId) || tenantId <= 0) {
      return;
    }

    this.authenticatedSignal.set(true);
    this.tenantIdSignal.set(tenantId);
  }

  clearAuthenticatedTenant(): void {
    this.authenticatedSignal.set(false);
    this.tenantIdSignal.set(null);
  }
}
