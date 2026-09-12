import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { SaveTenantSettingRequest, TenantSettingDto } from '../models/tenant-setting.model';

@Injectable({ providedIn: 'root' })
export class TenantSettingsService {
  private readonly api = inject(ApiService);

  getList(tenantId: number): Observable<ApiResponse<TenantSettingDto[]>> {
    return this.api.get<ApiResponse<TenantSettingDto[]>>(`/tenants/${tenantId}/settings`);
  }

  save(
    tenantId: number,
    key: string,
    request: SaveTenantSettingRequest
  ): Observable<ApiResponse<TenantSettingDto>> {
    const encodedKey = encodeURIComponent(key);
    return this.api.put<ApiResponse<TenantSettingDto>>(
      `/tenants/${tenantId}/settings/${encodedKey}`,
      request
    );
  }
}
