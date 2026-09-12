/** Matches backend Role / Permission DTOs (camelCase JSON). */

export interface PermissionDto {
  permissionId: number;
  moduleId: number;
  permissionCode: string;
  permissionName: string;
  description?: string | null;
}

export interface RoleDto {
  roleId: number;
  tenantId?: number | null;
  roleCode: string;
  roleName: string;
  description?: string | null;
  isSystemRole: boolean;
  isActive: boolean;
  createdDate: string;
  modifiedDate?: string | null;
  permissions: PermissionDto[];
}

export interface CreateRoleRequest {
  roleCode: string;
  roleName: string;
  description?: string | null;
  permissionIds?: number[] | null;
}

export interface UpdateRoleRequest {
  roleCode: string;
  roleName: string;
  description?: string | null;
  isActive: boolean;
}

export interface AssignRolePermissionsRequest {
  permissionIds: number[];
}
