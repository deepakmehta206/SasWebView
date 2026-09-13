import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { AuthStateService } from '../../../../core/auth/auth-state.service';
import { NotificationChannels, NotificationTemplateDto } from '../../../../core/notifications/notification.models';
import { NotificationTemplateService } from '../../../../core/notifications/notification-template.service';
import {
  formatChannelLabel,
  formatNotificationDateTime
} from '../../../../core/notifications/notification-display.util';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';

@Component({
  selector: 'app-notification-template-list',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective
  ],
  templateUrl: './notification-template-list.component.html',
  styleUrl: './notification-template-list.component.scss'
})
export class NotificationTemplateListComponent implements OnInit {
  private readonly api = inject(NotificationTemplateService);
  private readonly fb = inject(FormBuilder);
  readonly authState = inject(AuthStateService);

  readonly permissionCodes = PermissionCodes;
  readonly channels = [
    NotificationChannels.InApp,
    NotificationChannels.Email,
    NotificationChannels.Sms,
    NotificationChannels.WhatsApp
  ];
  readonly formatChannel = formatChannelLabel;
  readonly formatDate = formatNotificationDateTime;

  readonly loading = signal(true);
  readonly actingId = signal<number | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly rows = signal<NotificationTemplateDto[]>([]);

  readonly filterForm = this.fb.nonNullable.group({
    channel: [''],
    isActive: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    const channel = this.filterForm.controls.channel.value;
    const isActiveRaw = this.filterForm.controls.isActive.value;
    const params: { channel?: string; isActive?: boolean } = {};
    if (channel) {
      params.channel = channel;
    }
    if (isActiveRaw === 'true') {
      params.isActive = true;
    } else if (isActiveRaw === 'false') {
      params.isActive = false;
    }

    this.api.getList(params).subscribe({
      next: (data) => {
        this.rows.set(data);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load templates.'));
        this.loading.set(false);
      }
    });
  }

  isSystem(template: NotificationTemplateDto): boolean {
    return template.tenantId == null;
  }

  canEdit(template: NotificationTemplateDto): boolean {
    if (!this.isSystem(template)) {
      return true;
    }
    return this.authState.currentUser()?.isPlatformAdmin === true;
  }

  setActive(template: NotificationTemplateDto, isActive: boolean): void {
    if (!this.canEdit(template)) {
      return;
    }

    this.actingId.set(template.templateId);
    this.errorMessage.set(null);
    this.api.setStatus(template.templateId, { isActive }).subscribe({
      next: () => {
        this.rows.update((rows) =>
          rows.map((row) =>
            row.templateId === template.templateId ? { ...row, isActive } : row
          )
        );
        this.actingId.set(null);
      },
      error: (error: unknown) => {
        this.actingId.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to update template status.'));
      }
    });
  }
}
