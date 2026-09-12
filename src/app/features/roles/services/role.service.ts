import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  AssignRolePermissionsRequest,
  CreateRoleRequest,
  PermissionDto,
  RoleDto,
  UpdateRoleRequest
} from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly api = inject(ApiService);

  getList(): Observable<ApiResponse<RoleDto[]>> {
    return this.api.get<ApiResponse<RoleDto[]>>('/roles');
  }

  getById(roleId: number): Observable<ApiResponse<RoleDto>> {
    return this.api.get<ApiResponse<RoleDto>>(`/roles/${roleId}`);
  }

  create(request: CreateRoleRequest): Observable<ApiResponse<RoleDto>> {
    return this.api.post<ApiResponse<RoleDto>>('/roles', request);
  }

  update(roleId: number, request: UpdateRoleRequest): Observable<ApiResponse<RoleDto>> {
    return this.api.put<ApiResponse<RoleDto>>(`/roles/${roleId}`, request);
  }

  delete(roleId: number): Observable<ApiResponse<null>> {
    return this.api.delete<ApiResponse<null>>(`/roles/${roleId}`);
  }

  getPermissions(roleId: number): Observable<ApiResponse<PermissionDto[]>> {
    return this.api.get<ApiResponse<PermissionDto[]>>(`/roles/${roleId}/permissions`);
  }

  assignPermissions(
    roleId: number,
    request: AssignRolePermissionsRequest
  ): Observable<ApiResponse<null>> {
    return this.api.put<ApiResponse<null>>(`/roles/${roleId}/permissions`, request);
  }
}
