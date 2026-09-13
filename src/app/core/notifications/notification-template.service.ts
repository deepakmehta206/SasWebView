import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../services/api.service';
import { ApiResponse } from '../models/api-response.model';
import {
  CreateNotificationTemplateRequest,
  NotificationTemplateDto,
  NotificationTemplateListQuery,
  SetNotificationTemplateStatusRequest,
  UpdateNotificationTemplateRequest
} from './notification.models';

/** HTTP access for notification templates (Settings admin). */
@Injectable({ providedIn: 'root' })
export class NotificationTemplateService {
  private readonly api = inject(ApiService);

  getList(query?: NotificationTemplateListQuery): Observable<NotificationTemplateDto[]> {
    const params: Record<string, string | number | boolean> = {};
    if (query?.channel) {
      params['channel'] = query.channel;
    }
    if (query?.isActive !== undefined) {
      params['isActive'] = query.isActive;
    }

    return this.api
      .get<ApiResponse<NotificationTemplateDto[]>>('/notification-templates', { params })
      .pipe(map((response) => response.data ?? []));
  }

  getById(templateId: number): Observable<NotificationTemplateDto> {
    return this.api
      .get<ApiResponse<NotificationTemplateDto>>(`/notification-templates/${templateId}`)
      .pipe(map((response) => response.data as NotificationTemplateDto));
  }

  create(request: CreateNotificationTemplateRequest): Observable<NotificationTemplateDto> {
    return this.api
      .post<ApiResponse<NotificationTemplateDto>>('/notification-templates', request)
      .pipe(map((response) => response.data as NotificationTemplateDto));
  }

  update(
    templateId: number,
    request: UpdateNotificationTemplateRequest
  ): Observable<NotificationTemplateDto> {
    return this.api
      .put<ApiResponse<NotificationTemplateDto>>(`/notification-templates/${templateId}`, request)
      .pipe(map((response) => response.data as NotificationTemplateDto));
  }

  setStatus(
    templateId: number,
    request: SetNotificationTemplateStatusRequest
  ): Observable<void> {
    return this.api
      .patch<ApiResponse<null>>(`/notification-templates/${templateId}/status`, request)
      .pipe(map(() => undefined));
  }
}
