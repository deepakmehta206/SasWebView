import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { SetStatusRequest } from '../../tenant/models/tenant.model';
import { BranchDto, CreateBranchRequest, UpdateBranchRequest } from '../models/branch.model';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private readonly api = inject(ApiService);

  getList(tenantId: number): Observable<ApiResponse<BranchDto[]>> {
    return this.api.get<ApiResponse<BranchDto[]>>(`/tenants/${tenantId}/branches`);
  }

  getById(tenantId: number, branchId: number): Observable<ApiResponse<BranchDto>> {
    return this.api.get<ApiResponse<BranchDto>>(`/tenants/${tenantId}/branches/${branchId}`);
  }

  create(tenantId: number, request: CreateBranchRequest): Observable<ApiResponse<BranchDto>> {
    return this.api.post<ApiResponse<BranchDto>>(`/tenants/${tenantId}/branches`, request);
  }

  update(
    tenantId: number,
    branchId: number,
    request: UpdateBranchRequest
  ): Observable<ApiResponse<BranchDto>> {
    return this.api.put<ApiResponse<BranchDto>>(
      `/tenants/${tenantId}/branches/${branchId}`,
      request
    );
  }

  setStatus(
    tenantId: number,
    branchId: number,
    request: SetStatusRequest
  ): Observable<ApiResponse<null>> {
    return this.api.patch<ApiResponse<null>>(
      `/tenants/${tenantId}/branches/${branchId}/status`,
      request
    );
  }
}
