import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  AssignUserRolesRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UserDto,
  UserRoleAssignmentDto
} from '../../users/models/user.model';

@Injectable({ providedIn: 'root' })
export class AdminTenantUsersApiService {
  private readonly api = inject(ApiService);

  getUsers(tenantId: number): Observable<UserDto[]> {
    return this.api
      .get<ApiResponse<UserDto[]>>(`/admin/tenants/${tenantId}/users`)
      .pipe(map((response) => response.data ?? []));
  }

  getUser(tenantId: number, userId: number): Observable<UserDto> {
    return this.api
      .get<ApiResponse<UserDto>>(`/admin/tenants/${tenantId}/users/${userId}`)
      .pipe(map((response) => response.data as UserDto));
  }

  createUser(tenantId: number, request: CreateUserRequest): Observable<UserDto> {
    return this.api
      .post<ApiResponse<UserDto>>(`/admin/tenants/${tenantId}/users`, request)
      .pipe(map((response) => response.data as UserDto));
  }

  updateUser(tenantId: number, userId: number, request: UpdateUserRequest): Observable<UserDto> {
    return this.api
      .put<ApiResponse<UserDto>>(`/admin/tenants/${tenantId}/users/${userId}`, request)
      .pipe(map((response) => response.data as UserDto));
  }

  activateUser(tenantId: number, userId: number): Observable<unknown> {
    return this.api
      .post<ApiResponse<unknown>>(`/admin/tenants/${tenantId}/users/${userId}/activate`, {})
      .pipe(map((response) => response.data));
  }

  deactivateUser(tenantId: number, userId: number): Observable<unknown> {
    return this.api
      .post<ApiResponse<unknown>>(`/admin/tenants/${tenantId}/users/${userId}/deactivate`, {})
      .pipe(map((response) => response.data));
  }

  getUserRoles(tenantId: number, userId: number): Observable<UserRoleAssignmentDto[]> {
    return this.api
      .get<ApiResponse<UserRoleAssignmentDto[]>>(`/admin/tenants/${tenantId}/users/${userId}/roles`)
      .pipe(map((response) => response.data ?? []));
  }

  assignUserRoles(
    tenantId: number,
    userId: number,
    request: AssignUserRolesRequest
  ): Observable<unknown> {
    return this.api
      .put<ApiResponse<unknown>>(`/admin/tenants/${tenantId}/users/${userId}/roles`, request)
      .pipe(map((response) => response.data));
  }
}
