import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  CreateTenantRequest,
  SetStatusRequest,
  TenantDto,
  UpdateTenantRequest
} from '../models/tenant.model';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly api = inject(ApiService);

  getList(): Observable<ApiResponse<TenantDto[]>> {
    return this.api.get<ApiResponse<TenantDto[]>>('/tenants');
  }

  getById(tenantId: number): Observable<ApiResponse<TenantDto>> {
    return this.api.get<ApiResponse<TenantDto>>(`/tenants/${tenantId}`);
  }

  create(request: CreateTenantRequest): Observable<ApiResponse<TenantDto>> {
    return this.api.post<ApiResponse<TenantDto>>('/tenants', request);
  }

  update(tenantId: number, request: UpdateTenantRequest): Observable<ApiResponse<TenantDto>> {
    return this.api.put<ApiResponse<TenantDto>>(`/tenants/${tenantId}`, request);
  }

  setStatus(tenantId: number, request: SetStatusRequest): Observable<ApiResponse<null>> {
    return this.api.patch<ApiResponse<null>>(`/tenants/${tenantId}/status`, request);
  }
}
