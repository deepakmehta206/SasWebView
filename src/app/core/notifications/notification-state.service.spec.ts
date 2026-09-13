import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PermissionCodes } from '../constants/permission-codes';
import { PermissionService } from '../permissions/permission.service';
import { NotificationStateService } from './notification-state.service';
import { NotificationService } from './notification.service';
import { NotificationListItemDto } from './notification.models';

describe('NotificationStateService', () => {
  let state: NotificationStateService;
  let permissions: PermissionService;
  let api: jasmine.SpyObj<NotificationService>;

  const sample: NotificationListItemDto = {
    notificationId: 1,
    notificationType: 'LEAVE_APPROVED',
    title: 'Leave approved',
    message: 'Your leave was approved.',
    isRead: false,
    readDate: null,
    createdDate: '2026-01-01T00:00:00Z'
  };

  beforeEach(() => {
    api = jasmine.createSpyObj<NotificationService>('NotificationService', [
      'getList',
      'getUnreadCount',
      'markRead',
      'markAllRead'
    ]);

    TestBed.configureTestingModule({
      providers: [
        NotificationStateService,
        PermissionService,
        { provide: NotificationService, useValue: api }
      ]
    });

    state = TestBed.inject(NotificationStateService);
    permissions = TestBed.inject(PermissionService);
  });

  it('clears state', () => {
    permissions.setPermissions([PermissionCodes.NotificationView]);
    api.getList.and.returnValue(of([sample]));
    api.getUnreadCount.and.returnValue(of(3));

    state.load().subscribe();
    expect(state.unreadCount()).toBe(3);

    state.clear();
    expect(state.notifications()).toEqual([]);
    expect(state.unreadCount()).toBe(0);
    expect(state.hydrated()).toBeFalse();
  });

  it('updates unread after mark all read', () => {
    permissions.setPermissions([PermissionCodes.NotificationView]);
    api.getList.and.returnValue(of([sample]));
    api.getUnreadCount.and.returnValue(of(1));
    api.markAllRead.and.returnValue(of(undefined));

    state.load().subscribe();
    state.markAllRead().subscribe();

    expect(state.unreadCount()).toBe(0);
    expect(state.notifications()[0].isRead).toBeTrue();
  });

  it('sanitizes badge label for large counts', () => {
    permissions.setPermissions([PermissionCodes.NotificationView]);
    api.getUnreadCount.and.returnValue(of(120));
    state.refreshUnread().subscribe();
    expect(state.unreadBadgeLabel()).toBe('99+');
  });

  it('does not hydrate without permission', () => {
    permissions.clear();
    state.hydrateAfterAuth();
    expect(api.getUnreadCount).not.toHaveBeenCalled();
    expect(state.unreadCount()).toBe(0);
  });
});
