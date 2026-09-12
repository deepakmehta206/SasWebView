/** Matches backend User DTOs (camelCase JSON). */

export interface UserRoleAssignmentDto {
  roleId: number;
  roleCode: string;
  roleName: string;
  branchId?: number | null;
}

export interface UserDto {
  userId: number;
  tenantId: number;
  defaultBranchId?: number | null;
  username: string;
  email?: string | null;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  status: string;
  lastLoginDate?: string | null;
  isActive: boolean;
  createdDate: string;
  modifiedDate?: string | null;
  roles: UserRoleAssignmentDto[];
}

export interface UserRoleAssignmentRequest {
  roleId: number;
  branchId?: number | null;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email?: string | null;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  defaultBranchId?: number | null;
  status: string;
  roles?: UserRoleAssignmentRequest[] | null;
}

export interface UpdateUserRequest {
  username: string;
  email?: string | null;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  defaultBranchId?: number | null;
  status: string;
}

export interface AssignUserRolesRequest {
  roles: UserRoleAssignmentRequest[];
}

export interface SetStatusRequest {
  status: string;
  isActive: boolean;
}
