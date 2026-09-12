import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  SetTenantModuleRequest,
  TenantModuleDto
} from '../models/module.model';

@Injectable({ providedIn: 'root' })
export class TenantModuleService {
  private readonly api = inject(ApiService);

  getList(tenantId: number): Observable<ApiResponse<TenantModuleDto[]>> {
    return this.api.get<ApiResponse<TenantModuleDto[]>>(`/tenants/${tenantId}/modules`);
  }

  setEnabled(
    tenantId: number,
    moduleId: number,
    request: SetTenantModuleRequest
  ): Observable<ApiResponse<TenantModuleDto>> {
    return this.api.put<ApiResponse<TenantModuleDto>>(
      `/tenants/${tenantId}/modules/${moduleId}`,
      request
    );
  }
}
