import { Injectable, inject } from '@angular/core';
import { PermissionCodes } from './permission-codes';
import { FeatureCodes, ModuleCodes } from './feature-codes';
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
    enabled: true,
    anyPermissions: [PermissionCodes.SubscriptionView]
  },
  {
    label: 'Masters',
    route: '/masters',
    icon: 'masters',
    enabled: true,
    anyPermissions: [PermissionCodes.MasterView],
    children: [
      {
        label: 'Countries',
        route: '/masters/countries',
        enabled: true,
        anyPermissions: [PermissionCodes.MasterView]
      },
      {
        label: 'States',
        route: '/masters/states',
        enabled: true,
        anyPermissions: [PermissionCodes.MasterView]
      },
      {
        label: 'Cities',
        route: '/masters/cities',
        enabled: true,
        anyPermissions: [PermissionCodes.MasterView]
      },
      {
        label: 'Currencies',
        route: '/masters/currencies',
        enabled: true,
        anyPermissions: [PermissionCodes.MasterView]
      },
      {
        label: 'Payment modes',
        route: '/masters/payment-modes',
        enabled: true,
        anyPermissions: [PermissionCodes.MasterView]
      },
      {
        label: 'Document types',
        route: '/masters/document-types',
        enabled: true,
        anyPermissions: [PermissionCodes.MasterView]
      },
      {
        label: 'Units of measure',
        route: '/masters/units-of-measure',
        enabled: true,
        anyPermissions: [PermissionCodes.MasterView]
      }
    ]
  },
  {
    label: 'HRMS',
    route: '/hrms',
    icon: 'hrms',
    enabled: true,
    moduleCode: ModuleCodes.Hrms,
    children: [
      {
        label: 'Employees',
        route: '/hrms/employees',
        enabled: true,
        moduleCode: ModuleCodes.Hrms,
        featureCode: FeatureCodes.HrmsEmployee,
        anyPermissions: [PermissionCodes.EmployeeView]
      },
      {
        label: 'Departments',
        route: '/hrms/departments',
        enabled: true,
        moduleCode: ModuleCodes.Hrms,
        featureCode: FeatureCodes.HrmsEmployee,
        anyPermissions: [PermissionCodes.EmployeeView]
      },
      {
        label: 'Designations',
        route: '/hrms/designations',
        enabled: true,
        moduleCode: ModuleCodes.Hrms,
        featureCode: FeatureCodes.HrmsEmployee,
        anyPermissions: [PermissionCodes.EmployeeView]
      },
      {
        label: 'Employee Types',
        route: '/hrms/employee-types',
        enabled: true,
        moduleCode: ModuleCodes.Hrms,
        featureCode: FeatureCodes.HrmsEmployee,
        anyPermissions: [PermissionCodes.EmployeeView]
      },
      {
        label: 'Shifts',
        route: '/hrms/shifts',
        enabled: true,
        moduleCode: ModuleCodes.Hrms,
        featureCode: FeatureCodes.HrmsShift,
        anyPermissions: [PermissionCodes.AttendanceView]
      },
      {
        label: 'Holidays',
        route: '/hrms/holidays',
        enabled: true,
        moduleCode: ModuleCodes.Hrms,
        featureCode: FeatureCodes.HrmsAttendance,
        anyPermissions: [PermissionCodes.AttendanceView]
      },
      {
        label: 'Attendance',
        route: '/hrms/attendance',
        enabled: true,
        moduleCode: ModuleCodes.Hrms,
        featureCode: FeatureCodes.HrmsAttendance,
        anyPermissions: [PermissionCodes.AttendanceView]
      },
      {
        label: 'Overtime',
        route: '/hrms/overtime',
        enabled: true,
        moduleCode: ModuleCodes.Hrms,
        featureCode: FeatureCodes.HrmsOvertime,
        anyPermissions: [PermissionCodes.AttendanceView]
      },
      {
        label: 'Leave',
        route: '/hrms/leave',
        enabled: true,
        moduleCode: ModuleCodes.Hrms,
        featureCode: FeatureCodes.HrmsLeave,
        anyPermissions: [PermissionCodes.LeaveView]
      },
      {
        label: 'Salary',
        route: '/hrms/salary',
        enabled: true,
        moduleCode: ModuleCodes.Hrms,
        featureCode: FeatureCodes.HrmsPayroll,
        anyPermissions: [PermissionCodes.PayrollView]
      },
      {
        label: 'Payroll',
        route: '/hrms/payroll',
        enabled: true,
        moduleCode: ModuleCodes.Hrms,
        featureCode: FeatureCodes.HrmsPayroll,
        anyPermissions: [PermissionCodes.PayrollView, PermissionCodes.PayslipView]
      }
    ]
  },
  {
    label: 'Inventory',
    route: '/inventory',
    icon: 'inventory',
    enabled: true,
    moduleCode: ModuleCodes.Inventory,
    anyPermissions: [PermissionCodes.InventoryView],
    children: [
      {
        label: 'Items',
        route: '/inventory/items',
        enabled: true,
        moduleCode: ModuleCodes.Inventory,
        featureCode: FeatureCodes.InventoryItem,
        anyPermissions: [PermissionCodes.InventoryView]
      },
      {
        label: 'Stock',
        route: '/inventory/stock',
        enabled: true,
        moduleCode: ModuleCodes.Inventory,
        featureCode: FeatureCodes.InventoryStock,
        anyPermissions: [PermissionCodes.InventoryView]
      },
      {
        label: 'Purchases',
        route: '/inventory/purchase-orders',
        enabled: true,
        moduleCode: ModuleCodes.Inventory,
        featureCode: FeatureCodes.InventoryPurchase,
        anyPermissions: [PermissionCodes.InventoryView]
      }
    ]
  },
  {
    label: 'Billing',
    route: '/billing',
    icon: 'billing',
    enabled: true,
    moduleCode: ModuleCodes.Billing,
    anyPermissions: [PermissionCodes.BillingView],
    children: [
      {
        label: 'Customers',
        route: '/billing/customers',
        enabled: true,
        moduleCode: ModuleCodes.Billing,
        featureCode: FeatureCodes.BillingInvoice,
        anyPermissions: [PermissionCodes.BillingView]
      },
      {
        label: 'Invoices',
        route: '/billing/invoices',
        enabled: true,
        moduleCode: ModuleCodes.Billing,
        featureCode: FeatureCodes.BillingInvoice,
        anyPermissions: [PermissionCodes.BillingView]
      },
      {
        label: 'Payments',
        route: '/billing/payments',
        enabled: true,
        moduleCode: ModuleCodes.Billing,
        featureCode: FeatureCodes.BillingPayment,
        anyPermissions: [PermissionCodes.BillingView]
      }
    ]
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
   * - parents with children are hidden when no children remain
   */
  getVisibleNavItems(source: readonly NavItem[] = SIDEBAR_NAV_ITEMS): NavItem[] {
    this.permissions.permissions();
    this.featureAccess.modules();

    return source
      .map((item) => this.filterItem(item))
      .filter((item): item is NavItem => item != null);
  }

  getRoutePrefixesForModule(moduleCode: string): string[] {
    return this.collectRoutes(SIDEBAR_NAV_ITEMS, (item) => item.moduleCode === moduleCode);
  }

  getRoutePrefixesForFeature(featureCode: string): string[] {
    return this.collectRoutes(SIDEBAR_NAV_ITEMS, (item) => item.featureCode === featureCode);
  }

  private filterItem(item: NavItem): NavItem | null {
    if (item.moduleCode && !this.featureAccess.isModuleEnabled(item.moduleCode)) {
      return null;
    }

    if (item.featureCode && !this.featureAccess.isFeatureEnabled(item.featureCode)) {
      return null;
    }

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

      if (children.length === 0) {
        return null;
      }

      return { ...item, children };
    }

    return item;
  }

  private collectRoutes(
    items: readonly NavItem[],
    predicate: (item: NavItem) => boolean
  ): string[] {
    const routes: string[] = [];
    for (const item of items) {
      if (predicate(item) && item.route) {
        routes.push(item.route);
      }
      if (item.children?.length) {
        routes.push(...this.collectRoutes(item.children, predicate));
      }
    }
    return routes;
  }
}
