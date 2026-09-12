import { Injectable, inject } from '@angular/core';
import { PermissionCodes } from './permission-codes';
import { PermissionService } from '../permissions/permission.service';

export interface NavItem {
  label: string;
  route?: string;
  icon?: string;
  /** When false, item is a future placeholder (Soon). */
  enabled: boolean;
  /**
   * Optional permission requirements for visibility (UX only).
   * Omit for always-visible enabled items (e.g. Dashboard).
   */
  anyPermissions?: readonly string[];
  children?: NavItem[];
}

/**
 * Static nav definition. Visibility filtering uses PermissionService via NavigationService —
 * do not put permission logic in the sidebar component.
 */
export const SIDEBAR_NAV_ITEMS: readonly NavItem[] = [
  {
    label: 'Dashboard',
    route: '/dashboard',
    icon: 'dashboard',
    enabled: true
  },
  {
    label: 'Users',
    route: '/users',
    icon: 'users',
    enabled: true,
    anyPermissions: [PermissionCodes.UserView]
  },
  {
    label: 'Roles',
    route: '/roles',
    icon: 'roles',
    enabled: true,
    anyPermissions: [PermissionCodes.RoleView]
  },
  {
    label: 'Modules',
    route: '/modules',
    icon: 'modules',
    enabled: false
  },
  {
    label: 'Subscription',
    route: '/subscription',
    icon: 'subscription',
    enabled: false
  },
  {
    label: 'HRMS',
    route: '/hrms',
    icon: 'hrms',
    enabled: false
  },
  {
    label: 'Inventory',
    route: '/inventory',
    icon: 'inventory',
    enabled: false
  },
  {
    label: 'Billing',
    route: '/billing',
    icon: 'billing',
    enabled: false
  },
  {
    label: 'Settings',
    route: '/settings',
    icon: 'settings',
    enabled: true,
    anyPermissions: [PermissionCodes.TenantView, PermissionCodes.SettingsView]
  }
] as const;

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly permissions = inject(PermissionService);

  /**
   * Returns nav items visible for the current permission set.
   * Disabled (Soon) items remain visible as placeholders.
   */
  getVisibleNavItems(source: readonly NavItem[] = SIDEBAR_NAV_ITEMS): NavItem[] {
    return source
      .map((item) => this.filterItem(item))
      .filter((item): item is NavItem => item != null);
  }

  private filterItem(item: NavItem): NavItem | null {
    if (!item.enabled) {
      return item;
    }

    if (item.anyPermissions?.length && !this.permissions.hasAnyPermission(item.anyPermissions)) {
      return null;
    }

    return item;
  }
}
