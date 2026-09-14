import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AuditLogListItem, AuditLogQuery } from '../../audit/models/audit.models';

@Injectable({ providedIn: 'root' })
export class AdminAuditApiService {
  private readonly api = inject(ApiService);

  getPlatformAuditLogs(query?: AuditLogQuery): Observable<AuditLogListItem[]> {
    return this.api
      .get<ApiResponse<AuditLogListItem[]>>('/admin/audit-logs', {
        params: this.buildListParams(query)
      })
      .pipe(map((response) => response.data ?? []));
  }

  /** Builds query params; never includes tenantId. Omits empty/null/undefined. */
  buildListParams(query?: AuditLogQuery): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {};
    if (!query) {
      return params;
    }

    if (query.fromDate?.trim()) {
      params['fromDate'] = query.fromDate.trim();
    }
    if (query.toDate?.trim()) {
      params['toDate'] = query.toDate.trim();
    }
    if (query.userId !== undefined && query.userId !== null && !Number.isNaN(query.userId)) {
      params['userId'] = query.userId;
    }
    if (query.action?.trim()) {
      params['action'] = query.action.trim();
    }
    if (query.entityType?.trim()) {
      params['entityType'] = query.entityType.trim();
    }
    if (query.entityId?.trim()) {
      params['entityId'] = query.entityId.trim();
    }
    if (query.category?.trim()) {
      params['category'] = query.category.trim();
    }
    if (query.skip !== undefined && query.skip !== null) {
      params['skip'] = query.skip;
    }
    if (query.take !== undefined && query.take !== null) {
      params['take'] = query.take;
    }

    return params;
  }
}
