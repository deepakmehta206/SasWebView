import { RoleDto } from '../../roles/models/role.model';
import { UserDto } from '../../users/models/user.model';
import {
  assignableRoles,
  catalogWithoutPlatformAdmin,
  isLastActiveTenantAdmin,
  isLockedRole,
  isPlatformRole,
  parsePositiveId,
  requestHasTenantId
} from './admin-iam.util';

describe('admin-iam.util', () => {
  it('parses positive route ids', () => {
    expect(parsePositiveId('2002')).toBe(2002);
    expect(parsePositiveId('0')).toBeNull();
    expect(parsePositiveId('x')).toBeNull();
  });

  it('treats PLATFORM_ADMIN and null-tenant roles as platform roles', () => {
    expect(isPlatformRole({ roleCode: 'PLATFORM_ADMIN', tenantId: 2002 })).toBeTrue();
    expect(isPlatformRole({ roleCode: 'CUSTOM', tenantId: null })).toBeTrue();
    expect(isPlatformRole({ roleCode: 'TENANT_ADMIN', tenantId: 2002 })).toBeFalse();
  });

  it('locks system and TENANT_ADMIN roles', () => {
    expect(isLockedRole({ roleCode: 'TENANT_ADMIN', isSystemRole: true })).toBeTrue();
    expect(isLockedRole({ roleCode: 'BILLING_CLERK', isSystemRole: false })).toBeFalse();
  });

  it('filters assignable roles and PLATFORM_ADMIN permissions', () => {
    const roles: RoleDto[] = [
      role(1, 'PLATFORM_ADMIN', null, true),
      role(2, 'TENANT_ADMIN', 2002, true),
      role(3, 'BILLING_CLERK', 2002, false)
    ];
    expect(assignableRoles(roles).map((item) => item.roleCode)).toEqual(['TENANT_ADMIN', 'BILLING_CLERK']);
    expect(
      catalogWithoutPlatformAdmin([
        { permissionId: 1, moduleId: 1, permissionCode: 'PLATFORM_ADMIN', permissionName: 'Platform' },
        { permissionId: 2, moduleId: 1, permissionCode: 'USER_VIEW', permissionName: 'View users' }
      ]).map((item) => item.permissionCode)
    ).toEqual(['USER_VIEW']);
  });

  it('detects the last active TENANT_ADMIN', () => {
    const users: UserDto[] = [
      user(1, true, 'TENANT_ADMIN'),
      user(2, false, 'TENANT_ADMIN'),
      user(3, true, 'BILLING_CLERK')
    ];
    expect(isLastActiveTenantAdmin(users, 1)).toBeTrue();
    expect(isLastActiveTenantAdmin(users, 3)).toBeFalse();
  });

  it('detects tenantId on a request body', () => {
    expect(requestHasTenantId({ username: 'a' })).toBeFalse();
    expect(requestHasTenantId({ tenantId: 2002 })).toBeTrue();
  });
});

function role(roleId: number, roleCode: string, tenantId: number | null, isSystemRole: boolean): RoleDto {
  return {
    roleId,
    tenantId,
    roleCode,
    roleName: roleCode,
    isSystemRole,
    isActive: true,
    createdDate: '2026-01-01T00:00:00Z',
    permissions: []
  };
}

function user(userId: number, isActive: boolean, roleCode: string): UserDto {
  return {
    userId,
    tenantId: 2002,
    username: `user${userId}`,
    firstName: 'A',
    status: isActive ? 'Active' : 'Inactive',
    isActive,
    createdDate: '2026-01-01T00:00:00Z',
    roles: [{ roleId: userId, roleCode, roleName: roleCode }]
  };
}
