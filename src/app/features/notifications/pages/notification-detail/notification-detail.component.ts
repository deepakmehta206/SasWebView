import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { NotificationDto } from '../../../../core/notifications/notification.models';
import { NotificationService } from '../../../../core/notifications/notification.service';
import { NotificationStateService } from '../../../../core/notifications/notification-state.service';
import {
  formatNotificationDateTime,
  formatNotificationTypeLabel
} from '../../../../core/notifications/notification-display.util';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';

@Component({
  selector: 'app-notification-detail',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],
  templateUrl: './notification-detail.component.html',
  styleUrl: './notification-detail.component.scss'
})
export class NotificationDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(NotificationService);
  private readonly state = inject(NotificationStateService);

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly item = signal<NotificationDto | null>(null);

  readonly formatDate = formatNotificationDateTime;
  readonly formatType = formatNotificationTypeLabel;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || id <= 0) {
      this.errorMessage.set('Invalid notification.');
      this.loading.set(false);
      return;
    }

    this.api.getById(id).subscribe({
      next: (data) => {
        this.item.set(data);
        this.loading.set(false);
        if (!data.isRead) {
          this.state.markRead(data.notificationId).subscribe({
            next: () =>
              this.item.update((current) =>
                current ? { ...current, isRead: true, readDate: new Date().toISOString() } : current
              ),
            error: () => undefined
          });
        }
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load notification.'));
        this.loading.set(false);
      }
    });
  }
}
