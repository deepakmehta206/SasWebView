import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  AssignUserRolesRequest,
  CreateUserRequest,
  SetStatusRequest,
  UpdateUserRequest,
  UserDto
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  getList(): Observable<ApiResponse<UserDto[]>> {
    return this.api.get<ApiResponse<UserDto[]>>('/users');
  }

  getById(userId: number): Observable<ApiResponse<UserDto>> {
    return this.api.get<ApiResponse<UserDto>>(`/users/${userId}`);
  }

  create(request: CreateUserRequest): Observable<ApiResponse<UserDto>> {
    return this.api.post<ApiResponse<UserDto>>('/users', request);
  }

  update(userId: number, request: UpdateUserRequest): Observable<ApiResponse<UserDto>> {
    return this.api.put<ApiResponse<UserDto>>(`/users/${userId}`, request);
  }

  setStatus(userId: number, request: SetStatusRequest): Observable<ApiResponse<null>> {
    return this.api.patch<ApiResponse<null>>(`/users/${userId}/status`, request);
  }

  assignRoles(userId: number, request: AssignUserRolesRequest): Observable<ApiResponse<null>> {
    return this.api.post<ApiResponse<null>>(`/users/${userId}/roles`, request);
  }
}
