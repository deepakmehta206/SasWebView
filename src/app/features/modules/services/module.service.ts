import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { CreateModuleRequest, ModuleDto, UpdateModuleRequest } from '../models/module.model';
import { FeatureDto } from '../../features/models/feature.model';

@Injectable({ providedIn: 'root' })
export class ModuleService {
  private readonly api = inject(ApiService);

  getList(includeInactive = false): Observable<ApiResponse<ModuleDto[]>> {
    return this.api.get<ApiResponse<ModuleDto[]>>('/modules', {
      params: { includeInactive }
    });
  }

  getById(moduleId: number): Observable<ApiResponse<ModuleDto>> {
    return this.api.get<ApiResponse<ModuleDto>>(`/modules/${moduleId}`);
  }

  create(request: CreateModuleRequest): Observable<ApiResponse<ModuleDto>> {
    return this.api.post<ApiResponse<ModuleDto>>('/modules', request);
  }

  update(moduleId: number, request: UpdateModuleRequest): Observable<ApiResponse<ModuleDto>> {
    return this.api.put<ApiResponse<ModuleDto>>(`/modules/${moduleId}`, request);
  }

  getFeatures(moduleId: number, includeInactive = false): Observable<ApiResponse<FeatureDto[]>> {
    return this.api.get<ApiResponse<FeatureDto[]>>(`/modules/${moduleId}/features`, {
      params: { includeInactive }
    });
  }
}
