import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  CreateFeatureRequest,
  FeatureDto,
  UpdateFeatureRequest
} from '../models/feature.model';

@Injectable({ providedIn: 'root' })
export class FeatureCatalogService {
  private readonly api = inject(ApiService);

  getList(includeInactive = false): Observable<ApiResponse<FeatureDto[]>> {
    return this.api.get<ApiResponse<FeatureDto[]>>('/features', {
      params: { includeInactive }
    });
  }

  create(request: CreateFeatureRequest): Observable<ApiResponse<FeatureDto>> {
    return this.api.post<ApiResponse<FeatureDto>>('/features', request);
  }

  update(featureId: number, request: UpdateFeatureRequest): Observable<ApiResponse<FeatureDto>> {
    return this.api.put<ApiResponse<FeatureDto>>(`/features/${featureId}`, request);
  }
}
