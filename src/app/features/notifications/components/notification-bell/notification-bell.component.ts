import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { NotificationStateService } from '../../../../core/notifications/notification-state.service';
import {
  formatNotificationDateTime,
  formatNotificationTypeLabel
} from '../../../../core/notifications/notification-display.util';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [RouterLink, HasPermissionDirective],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss'
})
export class NotificationBellComponent {
  readonly permissionCodes = PermissionCodes;
  readonly state = inject(NotificationStateService);

  readonly open = signal(false);
  readonly markingAll = signal(false);
  readonly actionError = signal<string | null>(null);

  readonly formatDate = formatNotificationDateTime;
  readonly formatType = formatNotificationTypeLabel;

  toggle(): void {
    const next = !this.open();
    this.open.set(next);
    this.actionError.set(null);
    if (next) {
      this.state.loadRecentForPopover().subscribe({ error: () => undefined });
    }
  }

  close(): void {
    this.open.set(false);
  }

  markAllRead(): void {
    this.markingAll.set(true);
    this.actionError.set(null);
    this.state.markAllRead().subscribe({
      next: () => this.markingAll.set(false),
      error: (error: unknown) => {
        this.markingAll.set(false);
        this.actionError.set(extractApiErrorMessage(error, 'Unable to mark all as read.'));
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.notification-bell')) {
      this.close();
    }
  }
}
