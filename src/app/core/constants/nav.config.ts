import { Injectable, inject } from '@angular/core';
import { PermissionCodes } from './permission-codes';
import { PermissionService } from '../permissions/permission.service';
import { FeatureAccessService } from '../entitlements/feature-access.service';

export interface NavItem {
  label: string;
  route?: string;
  icon?: string;
  /**
   * When false, item is a future placeholder (Soon) — still subject to module/feature gating.
   * When true, item is navigable if module/feature/permission checks pass.
   */
  enabled: boolean;
  /** Product module code (e.g. HRMS). Disabled module hides the item entirely. */
  moduleCode?: string;
  /** Feature code (e.g. HRMS_EMPLOYEE). Disabled feature hides the item. */
  featureCode?: string;
  /**
   * Optional permission requirements (UX only).
   * Evaluated only after module/feature checks pass.
   */
  anyPermissions?: readonly string[];
  children?: NavItem[];
}

/**
 * Static nav definition.
 * Visibility = FeatureAccessService + PermissionService via NavigationService.
 * Do not put module/permission logic in the sidebar component.
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
    enabled: true,
    anyPermissions: [PermissionCodes.ModuleView]
  },
  {
    label: 'Features',
    route: '/features',
    icon: 'features',
    enabled: true,
    anyPermissions: [PermissionCodes.FeatureView]
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
    enabled: false,
    moduleCode: 'HRMS'
  },
  {
    label: 'Inventory',
    route: '/inventory',
    icon: 'inventory',
    enabled: false,
    moduleCode: 'INVENTORY'
  },
  {
    label: 'Billing',
    route: '/billing',
    icon: 'billing',
    enabled: false,
    moduleCode: 'BILLING'
  },
  {
    label: 'Hospital',
    route: '/hospital',
    icon: 'hospital',
    enabled: false,
    moduleCode: 'HOSPITAL'
  },
  {
    label: 'School',
    route: '/school',
    icon: 'school',
    enabled: false,
    moduleCode: 'SCHOOL'
  },
  {
    label: 'Clinic',
    route: '/clinic',
    icon: 'clinic',
    enabled: false,
    moduleCode: 'CLINIC'
  },
  {
    label: 'Settings',
    route: '/settings',
    icon: 'settings',
    enabled: true,
    anyPermissions: [PermissionCodes.TenantView, PermissionCodes.SettingsView]
  }
];

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly permissions = inject(PermissionService);
  private readonly featureAccess = inject(FeatureAccessService);

  /**
   * Evaluation order (approved):
   * - moduleCode / featureCode must pass (even for Soon items)
   * - enabled === false → show as Soon (caller renders badge)
   * - enabled === true → permission check → visible
   */
  getVisibleNavItems(source: readonly NavItem[] = SIDEBAR_NAV_ITEMS): NavItem[] {
    // Track signal dependencies for sidebar computed().
    this.permissions.permissions();
    this.featureAccess.modules();

    return source
      .map((item) => this.filterItem(item))
      .filter((item): item is NavItem => item != null);
  }

  /**
   * Route prefixes that belong to a module (for disable redirect).
   */
  getRoutePrefixesForModule(moduleCode: string): string[] {
    return SIDEBAR_NAV_ITEMS.filter(
      (item) => item.moduleCode === moduleCode && !!item.route
    ).map((item) => item.route!);
  }

  getRoutePrefixesForFeature(featureCode: string): string[] {
    return SIDEBAR_NAV_ITEMS.filter(
      (item) => item.featureCode === featureCode && !!item.route
    ).map((item) => item.route!);
  }

  private filterItem(item: NavItem): NavItem | null {
    if (item.moduleCode && !this.featureAccess.isModuleEnabled(item.moduleCode)) {
      return null;
    }

    if (item.featureCode && !this.featureAccess.isFeatureEnabled(item.featureCode)) {
      return null;
    }

    // Soon placeholder — visible only if module/feature gates passed.
    if (!item.enabled) {
      return item;
    }

    if (item.anyPermissions?.length && !this.permissions.hasAnyPermission(item.anyPermissions)) {
      return null;
    }

    if (item.children?.length) {
      const children = item.children
        .map((child) => this.filterItem(child))
        .filter((child): child is NavItem => child != null);
      return { ...item, children };
    }

    return item;
  }
}
