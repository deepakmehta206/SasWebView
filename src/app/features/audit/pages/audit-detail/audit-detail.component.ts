import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { formatNotificationDateTime } from '../../../../core/notifications/notification-display.util';
import { AuditLog } from '../../models/audit.models';
import { AuditApiService } from '../../services/audit-api.service';
import {
  categoryPillModifier,
  formatAuditActionLabel,
  formatAuditCategoryLabel,
  formatAuditEntity,
  formatAuditJson
} from '../../utils/audit-display.util';

@Component({
  selector: 'app-audit-detail',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './audit-detail.component.html',
  styleUrl: './audit-detail.component.scss'
})
export class AuditDetailComponent implements OnInit {
  private readonly api = inject(AuditApiService);
  private readonly route = inject(ActivatedRoute);

  readonly formatDate = formatNotificationDateTime;
  readonly formatCategory = formatAuditCategoryLabel;
  readonly formatAction = formatAuditActionLabel;
  readonly formatEntity = formatAuditEntity;
  readonly formatJson = formatAuditJson;
  readonly pillClass = categoryPillModifier;

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly row = signal<AuditLog | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const id = Number(this.route.snapshot.paramMap.get('auditLogId'));
    if (!Number.isFinite(id) || id <= 0) {
      this.loading.set(false);
      this.row.set(null);
      this.errorMessage.set('Audit log was not found.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.api.getAuditLog(id).subscribe({
      next: (data) => {
        this.row.set(data);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.row.set(null);
        const status = (error as { status?: number })?.status;
        this.errorMessage.set(
          extractApiErrorMessage(
            error,
            status === 404 ? 'Audit log was not found.' : 'Unable to load audit log.'
          )
        );
        this.loading.set(false);
      }
    });
  }
}
