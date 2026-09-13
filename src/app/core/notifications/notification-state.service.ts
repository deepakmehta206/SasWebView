import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, tap, throwError } from 'rxjs';
import { PermissionCodes } from '../constants/permission-codes';
import { PermissionService } from '../permissions/permission.service';
import { extractApiErrorMessage } from '../utils/api-error.util';
import { NotificationListItemDto } from './notification.models';
import { NotificationService } from './notification.service';

const RECENT_TAKE = 8;
const LIST_TAKE = 50;

/**
 * Centralized inbox / unread Signal state.
 * Does not depend on AuthService (avoids circular DI).
 * AuthService calls clear() / hydrateAfterAuth() on session lifecycle.
 */
@Injectable({ providedIn: 'root' })
export class NotificationStateService {
  private readonly api = inject(NotificationService);
  private readonly permissions = inject(PermissionService);

  private readonly notificationsSignal = signal<NotificationListItemDto[]>([]);
  private readonly unreadCountSignal = signal(0);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly hydratedSignal = signal(false);

  readonly notifications = this.notificationsSignal.asReadonly();
  readonly unreadCount = this.unreadCountSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly hydrated = this.hydratedSignal.asReadonly();

  readonly unreadBadgeLabel = computed(() => {
    const count = this.sanitizeCount(this.unreadCountSignal());
    if (count <= 0) {
      return '';
    }
    return count > 99 ? '99+' : String(count);
  });

  readonly hasUnread = computed(() => this.sanitizeCount(this.unreadCountSignal()) > 0);

  /** Called after login /me / refresh when permissions are already set. */
  hydrateAfterAuth(): void {
    if (!this.permissions.hasPermission(PermissionCodes.NotificationView)) {
      this.clear();
      return;
    }

    this.refreshUnread().subscribe({ error: () => undefined });
  }

  clear(): void {
    this.notificationsSignal.set([]);
    this.unreadCountSignal.set(0);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
    this.hydratedSignal.set(false);
  }

  load(options?: { isRead?: boolean; skip?: number; take?: number }): Observable<NotificationListItemDto[]> {
    if (!this.permissions.hasPermission(PermissionCodes.NotificationView)) {
      this.clear();
      return of([]);
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const take = options?.take ?? LIST_TAKE;
    const skip = options?.skip ?? 0;

    return forkJoin({
      items: this.api.getList({
        isRead: options?.isRead,
        skip,
        take
      }),
      unread: this.api.getUnreadCount()
    }).pipe(
      tap(({ items, unread }) => {
        this.notificationsSignal.set(items);
        this.unreadCountSignal.set(this.sanitizeCount(unread));
        this.loadingSignal.set(false);
        this.hydratedSignal.set(true);
      }),
      map(({ items }) => items),
      catchError((error: unknown) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(extractApiErrorMessage(error, 'Unable to load notifications.'));
        return throwError(() => error);
      })
    );
  }

  /** Lightweight unread refresh for header badge. */
  refreshUnread(): Observable<number> {
    if (!this.permissions.hasPermission(PermissionCodes.NotificationView)) {
      this.unreadCountSignal.set(0);
      return of(0);
    }

    return this.api.getUnreadCount().pipe(
      tap((count) => {
        this.unreadCountSignal.set(this.sanitizeCount(count));
        this.hydratedSignal.set(true);
      }),
      catchError(() => {
        return of(this.unreadCountSignal());
      })
    );
  }

  /** Recent items for header popover (does not replace full list unless empty). */
  loadRecentForPopover(): Observable<NotificationListItemDto[]> {
    if (!this.permissions.hasPermission(PermissionCodes.NotificationView)) {
      return of([]);
    }

    return forkJoin({
      items: this.api.getList({ skip: 0, take: RECENT_TAKE }),
      unread: this.api.getUnreadCount()
    }).pipe(
      tap(({ items, unread }) => {
        this.notificationsSignal.set(items);
        this.unreadCountSignal.set(this.sanitizeCount(unread));
        this.hydratedSignal.set(true);
        this.errorSignal.set(null);
      }),
      map(({ items }) => items),
      catchError((error: unknown) => {
        this.errorSignal.set(extractApiErrorMessage(error, 'Unable to load notifications.'));
        return of(this.notificationsSignal());
      })
    );
  }

  markRead(notificationId: number): Observable<void> {
    return this.api.markRead(notificationId).pipe(
      tap(() => {
        this.notificationsSignal.update((rows) =>
          rows.map((row) =>
            row.notificationId === notificationId
              ? { ...row, isRead: true, readDate: new Date().toISOString() }
              : row
          )
        );
        this.unreadCountSignal.update((count) => Math.max(0, this.sanitizeCount(count) - 1));
      }),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.notificationsSignal.update((rows) =>
            rows.map((row) =>
              row.notificationId === notificationId ? { ...row, isRead: true } : row
            )
          );
          this.refreshUnread().subscribe({ error: () => undefined });
          return of(undefined);
        }
        return throwError(() => error);
      })
    );
  }

  markAllRead(): Observable<void> {
    return this.api.markAllRead().pipe(
      tap(() => {
        this.notificationsSignal.update((rows) =>
          rows.map((row) => ({ ...row, isRead: true, readDate: row.readDate ?? new Date().toISOString() }))
        );
        this.unreadCountSignal.set(0);
      })
    );
  }

  private sanitizeCount(value: number): number {
    if (!Number.isFinite(value) || value < 0) {
      return 0;
    }
    return Math.floor(value);
  }
}
