import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { SetTenantFeatureRequest, TenantFeatureDto } from '../models/feature.model';

@Injectable({ providedIn: 'root' })
export class TenantFeatureService {
  private readonly api = inject(ApiService);

  getList(tenantId: number): Observable<ApiResponse<TenantFeatureDto[]>> {
    return this.api.get<ApiResponse<TenantFeatureDto[]>>(`/tenants/${tenantId}/features`);
  }

  setEnabled(
    tenantId: number,
    featureId: number,
    request: SetTenantFeatureRequest
  ): Observable<ApiResponse<TenantFeatureDto>> {
    return this.api.put<ApiResponse<TenantFeatureDto>>(
      `/tenants/${tenantId}/features/${featureId}`,
      request
    );
  }
}
