import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  AssignRolePermissionsRequest,
  CreateRoleRequest,
  PermissionDto,
  RoleDto,
  UpdateRoleRequest
} from '../../roles/models/role.model';

@Injectable({ providedIn: 'root' })
export class AdminTenantRolesApiService {
  private readonly api = inject(ApiService);

  getRoles(tenantId: number): Observable<RoleDto[]> {
    return this.api
      .get<ApiResponse<RoleDto[]>>(`/admin/tenants/${tenantId}/roles`)
      .pipe(map((response) => response.data ?? []));
  }

  getRole(tenantId: number, roleId: number): Observable<RoleDto> {
    return this.api
      .get<ApiResponse<RoleDto>>(`/admin/tenants/${tenantId}/roles/${roleId}`)
      .pipe(map((response) => response.data as RoleDto));
  }

  createRole(tenantId: number, request: CreateRoleRequest): Observable<RoleDto> {
    return this.api
      .post<ApiResponse<RoleDto>>(`/admin/tenants/${tenantId}/roles`, request)
      .pipe(map((response) => response.data as RoleDto));
  }

  updateRole(tenantId: number, roleId: number, request: UpdateRoleRequest): Observable<RoleDto> {
    return this.api
      .put<ApiResponse<RoleDto>>(`/admin/tenants/${tenantId}/roles/${roleId}`, request)
      .pipe(map((response) => response.data as RoleDto));
  }

  getRolePermissions(tenantId: number, roleId: number): Observable<PermissionDto[]> {
    return this.api
      .get<ApiResponse<PermissionDto[]>>(`/admin/tenants/${tenantId}/roles/${roleId}/permissions`)
      .pipe(map((response) => response.data ?? []));
  }

  assignRolePermissions(
    tenantId: number,
    roleId: number,
    request: AssignRolePermissionsRequest
  ): Observable<unknown> {
    return this.api
      .put<ApiResponse<unknown>>(
        `/admin/tenants/${tenantId}/roles/${roleId}/permissions`,
        request
      )
      .pipe(map((response) => response.data));
  }

  getPermissionCatalog(): Observable<PermissionDto[]> {
    return this.api
      .get<ApiResponse<PermissionDto[]>>('/admin/permissions')
      .pipe(map((response) => response.data ?? []));
  }
}
