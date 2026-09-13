import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { NotificationStateService } from '../../../../core/notifications/notification-state.service';
import {
  formatNotificationDateTime,
  formatNotificationTypeLabel
} from '../../../../core/notifications/notification-display.util';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective
  ],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss'
})
export class NotificationListComponent implements OnInit {
  readonly permissionCodes = PermissionCodes;
  readonly state = inject(NotificationStateService);

  readonly markingAll = signal(false);
  readonly actionError = signal<string | null>(null);

  readonly formatDate = formatNotificationDateTime;
  readonly formatType = formatNotificationTypeLabel;

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.actionError.set(null);
    this.state.load().subscribe({ error: () => undefined });
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
}
