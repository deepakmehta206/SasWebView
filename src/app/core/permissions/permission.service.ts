import { Injectable, computed, inject, signal } from '@angular/core';

/**
 * Holds the current user's permission codes for UX (nav, buttons, guards).
 * Not a security boundary — backend enforces authorization.
 */
@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly permissionsSignal = signal<readonly string[]>([]);

  readonly permissions = this.permissionsSignal.asReadonly();
  readonly permissionSet = computed(() => new Set(this.permissionsSignal()));

  setPermissions(permissions: readonly string[] | null | undefined): void {
    const normalized = (permissions ?? [])
      .map((code) => code.trim())
      .filter((code) => code.length > 0);
    this.permissionsSignal.set(normalized);
  }

  clear(): void {
    this.permissionsSignal.set([]);
  }

  hasPermission(permissionCode: string): boolean {
    return this.permissionSet().has(permissionCode);
  }

  hasAnyPermission(permissionCodes: readonly string[]): boolean {
    if (permissionCodes.length === 0) {
      return true;
    }

    const set = this.permissionSet();
    return permissionCodes.some((code) => set.has(code));
  }

  hasAllPermissions(permissionCodes: readonly string[]): boolean {
    if (permissionCodes.length === 0) {
      return true;
    }

    const set = this.permissionSet();
    return permissionCodes.every((code) => set.has(code));
  }
}
