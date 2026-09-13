import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../services/api.service';
import { ApiResponse } from '../models/api-response.model';
import {
  NotificationDto,
  NotificationListItemDto,
  NotificationListQuery,
  NotificationPreferenceDto,
  NotificationUnreadCountDto,
  UpsertNotificationPreferencesRequest
} from './notification.models';

/**
 * HTTP access for in-app notifications and preferences.
 * Components should prefer NotificationStateService for inbox/unread state.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiService);

  getList(query?: NotificationListQuery): Observable<NotificationListItemDto[]> {
    const params: Record<string, string | number | boolean> = {};
    if (query?.isRead !== undefined) {
      params['isRead'] = query.isRead;
    }
    if (query?.skip !== undefined) {
      params['skip'] = query.skip;
    }
    if (query?.take !== undefined) {
      params['take'] = query.take;
    }

    return this.api
      .get<ApiResponse<NotificationListItemDto[]>>('/notifications', { params })
      .pipe(map((response) => response.data ?? []));
  }

  getUnreadCount(): Observable<number> {
    return this.api
      .get<ApiResponse<NotificationUnreadCountDto>>('/notifications/unread-count')
      .pipe(map((response) => Math.max(0, response.data?.unreadCount ?? 0)));
  }

  getById(notificationId: number): Observable<NotificationDto> {
    return this.api
      .get<ApiResponse<NotificationDto>>(`/notifications/${notificationId}`)
      .pipe(map((response) => response.data as NotificationDto));
  }

  markRead(notificationId: number): Observable<void> {
    return this.api
      .patch<ApiResponse<null>>(`/notifications/${notificationId}/read`, {})
      .pipe(map(() => undefined));
  }

  markAllRead(): Observable<void> {
    return this.api
      .patch<ApiResponse<null>>('/notifications/read-all', {})
      .pipe(map(() => undefined));
  }

  getPreferences(): Observable<NotificationPreferenceDto[]> {
    return this.api
      .get<ApiResponse<NotificationPreferenceDto[]>>('/notifications/preferences')
      .pipe(map((response) => response.data ?? []));
  }

  upsertPreferences(
    request: UpsertNotificationPreferencesRequest
  ): Observable<NotificationPreferenceDto[]> {
    return this.api
      .put<ApiResponse<NotificationPreferenceDto[]>>('/notifications/preferences', request)
      .pipe(map((response) => response.data ?? []));
  }
}
