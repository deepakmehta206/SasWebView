import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { PlanDto } from '../models/subscription.models';

/**
 * Tenant plan catalog (read-only for Phase 5).
 * Does not call PLAN_MANAGE create/update endpoints.
 */
@Injectable({ providedIn: 'root' })
export class PlanService {
  private readonly api = inject(ApiService);

  getList(includeInactive = false): Observable<PlanDto[]> {
    return this.api
      .get<ApiResponse<PlanDto[]>>('/plans', {
        params: { includeInactive }
      })
      .pipe(map((response) => response.data ?? []));
  }

  getById(planId: number): Observable<PlanDto> {
    return this.api
      .get<ApiResponse<PlanDto>>(`/plans/${planId}`)
      .pipe(map((response) => response.data as PlanDto));
  }
}
