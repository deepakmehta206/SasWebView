/**
 * Permission codes matching SaaSPlatform.Domain.Constants.PermissionCodes.
 * Frontend checks are UX-only — backend remains authoritative.
 */
export const PermissionCodes = {
  UserView: 'USER_VIEW',
  UserAdd: 'USER_ADD',
  UserEdit: 'USER_EDIT',
  UserDelete: 'USER_DELETE',

  RoleView: 'ROLE_VIEW',
  RoleAdd: 'ROLE_ADD',
  RoleEdit: 'ROLE_EDIT',
  RoleDelete: 'ROLE_DELETE',

  SettingsView: 'SETTINGS_VIEW',
  SettingsEdit: 'SETTINGS_EDIT',

  TenantView: 'TENANT_VIEW',
  TenantAdd: 'TENANT_ADD',
  TenantEdit: 'TENANT_EDIT'
} as const;

export type PermissionCode = (typeof PermissionCodes)[keyof typeof PermissionCodes];
