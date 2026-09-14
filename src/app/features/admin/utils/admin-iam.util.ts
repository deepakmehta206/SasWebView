import { PermissionDto, RoleDto } from '../../roles/models/role.model';
import { UserDto } from '../../users/models/user.model';

export const PLATFORM_ROLE_CODE = 'PLATFORM_ADMIN';
export const TENANT_ADMIN_ROLE_CODE = 'TENANT_ADMIN';

export function parsePositiveId(raw: string | null | undefined): number | null {
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }
  return id;
}

export function isPlatformRole(role: Pick<RoleDto, 'roleCode' | 'tenantId'>): boolean {
  return (
    role.tenantId == null ||
    role.roleCode.trim().toUpperCase() === PLATFORM_ROLE_CODE
  );
}

export function isLockedRole(role: Pick<RoleDto, 'roleCode' | 'isSystemRole'>): boolean {
  const code = role.roleCode.trim().toUpperCase();
  return role.isSystemRole || code === PLATFORM_ROLE_CODE || code === TENANT_ADMIN_ROLE_CODE;
}

export function assignableRoles(roles: readonly RoleDto[]): RoleDto[] {
  return roles.filter((role) => !isPlatformRole(role));
}

export function catalogWithoutPlatformAdmin(permissions: readonly PermissionDto[]): PermissionDto[] {
  return permissions.filter(
    (permission) => permission.permissionCode.trim().toUpperCase() !== PLATFORM_ROLE_CODE
  );
}

export function hasTenantAdminRole(user: UserDto | null | undefined): boolean {
  return (
    user?.roles.some(
      (role) => role.roleCode.trim().toUpperCase() === TENANT_ADMIN_ROLE_CODE
    ) === true
  );
}

export function isLastActiveTenantAdmin(users: readonly UserDto[], userId: number): boolean {
  const current = users.find((user) => user.userId === userId);
  if (!hasTenantAdminRole(current)) {
    return false;
  }

  return !users.some(
    (user) => user.userId !== userId && user.isActive && hasTenantAdminRole(user)
  );
}

export function requestHasTenantId(body: object): boolean {
  return Object.prototype.hasOwnProperty.call(body, 'tenantId');
}
