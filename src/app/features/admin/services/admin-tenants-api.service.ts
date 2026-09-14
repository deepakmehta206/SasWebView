import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  PlatformTenantDetail,
  PlatformTenantListItem,
  PlatformTenantUpdateRequest,
  ProvisionTenantRequest,
  ProvisionTenantResponse
} from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminTenantsApiService {
  private readonly api = inject(ApiService);

  getTenants(): Observable<PlatformTenantListItem[]> {
    return this.api
      .get<ApiResponse<PlatformTenantListItem[]>>('/admin/tenants')
      .pipe(map((response) => response.data ?? []));
  }

  getTenant(id: number): Observable<PlatformTenantDetail> {
    return this.api
      .get<ApiResponse<PlatformTenantDetail>>(`/admin/tenants/${id}`)
      .pipe(map((response) => response.data as PlatformTenantDetail));
  }

  provisionTenant(request: ProvisionTenantRequest): Observable<ProvisionTenantResponse> {
    return this.api
      .post<ApiResponse<ProvisionTenantResponse>>('/admin/tenants/provision', request)
      .pipe(map((response) => response.data as ProvisionTenantResponse));
  }

  updateTenant(id: number, request: PlatformTenantUpdateRequest): Observable<PlatformTenantDetail> {
    return this.api
      .put<ApiResponse<PlatformTenantDetail>>(`/admin/tenants/${id}`, request)
      .pipe(map((response) => response.data as PlatformTenantDetail));
  }

  activateTenant(id: number): Observable<unknown> {
    return this.api
      .post<ApiResponse<unknown>>(`/admin/tenants/${id}/activate`, {})
      .pipe(map((response) => response.data));
  }

  suspendTenant(id: number): Observable<unknown> {
    return this.api
      .post<ApiResponse<unknown>>(`/admin/tenants/${id}/suspend`, {})
      .pipe(map((response) => response.data));
  }
}
