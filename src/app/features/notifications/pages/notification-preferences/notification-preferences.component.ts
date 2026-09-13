import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionService } from '../../../../core/permissions/permission.service';
import {
  NotificationChannels,
  NotificationPreferenceDto
} from '../../../../core/notifications/notification.models';
import { NotificationService } from '../../../../core/notifications/notification.service';
import {
  formatChannelLabel,
  formatNotificationTypeLabel
} from '../../../../core/notifications/notification-display.util';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';

interface PreferenceRow {
  notificationType: string;
  typeLabel: string;
  channels: Record<string, { enabled: boolean; mandatory: boolean }>;
}

const CHANNEL_ORDER = [
  NotificationChannels.InApp,
  NotificationChannels.Email,
  NotificationChannels.Sms,
  NotificationChannels.WhatsApp
];

@Component({
  selector: 'app-notification-preferences',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective
  ],
  templateUrl: './notification-preferences.component.html',
  styleUrl: './notification-preferences.component.scss'
})
export class NotificationPreferencesComponent implements OnInit {
  private readonly api = inject(NotificationService);
  private readonly permissions = inject(PermissionService);

  readonly permissionCodes = PermissionCodes;
  readonly channelOrder = CHANNEL_ORDER;
  readonly formatChannel = formatChannelLabel;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly rows = signal<PreferenceRow[]>([]);
  readonly canEdit = signal(false);

  ngOnInit(): void {
    this.canEdit.set(this.permissions.hasPermission(PermissionCodes.NotificationPreferenceEdit));
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.api.getPreferences().subscribe({
      next: (prefs) => {
        this.rows.set(this.toRows(prefs));
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load preferences.'));
        this.loading.set(false);
      }
    });
  }

  toggle(type: string, channel: string, checked: boolean): void {
    this.rows.update((current) =>
      current.map((row) => {
        if (row.notificationType !== type) {
          return row;
        }
        const cell = row.channels[channel];
        if (!cell || cell.mandatory) {
          return row;
        }
        return {
          ...row,
          channels: {
            ...row.channels,
            [channel]: { ...cell, enabled: checked }
          }
        };
      })
    );
  }

  save(): void {
    if (!this.canEdit()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const preferences = this.rows().flatMap((row) =>
      CHANNEL_ORDER.filter((channel) => row.channels[channel]).map((channel) => ({
        notificationType: row.notificationType,
        channel,
        isEnabled: row.channels[channel].enabled
      }))
    );

    this.api.upsertPreferences({ preferences }).subscribe({
      next: (prefs) => {
        this.rows.set(this.toRows(prefs));
        this.saving.set(false);
        this.successMessage.set('Preferences saved.');
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save preferences.'));
      }
    });
  }

  private toRows(prefs: NotificationPreferenceDto[]): PreferenceRow[] {
    const byType = new Map<string, PreferenceRow>();

    for (const pref of prefs) {
      let row = byType.get(pref.notificationType);
      if (!row) {
        row = {
          notificationType: pref.notificationType,
          typeLabel: formatNotificationTypeLabel(pref.notificationType),
          channels: {}
        };
        byType.set(pref.notificationType, row);
      }
      row.channels[pref.channel] = {
        enabled: pref.isMandatory ? true : pref.isEnabled,
        mandatory: pref.isMandatory
      };
    }

    return [...byType.values()];
  }
}
