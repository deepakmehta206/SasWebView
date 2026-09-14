import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { formatNotificationDateTime } from '../../../../core/notifications/notification-display.util';
import {
  AUDIT_ACTIONS_BY_CATEGORY,
  AUDIT_CATEGORIES,
  AUDIT_PAGE_SIZE,
  AuditCategory,
  AuditLogListItem,
  AuditLogQuery
} from '../../../audit/models/audit.models';
import {
  categoryPillModifier,
  formatAuditActionLabel,
  formatAuditCategoryLabel,
  formatAuditEntity,
  toAuditFromDateUtc,
  toAuditToDateUtc
} from '../../../audit/utils/audit-display.util';
import { AdminAuditApiService } from '../../services/admin-audit-api.service';

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './admin-audit.component.html',
  styleUrl: './admin-audit.component.scss'
})
export class AdminAuditComponent implements OnInit {
  private readonly api = inject(AdminAuditApiService);
  private readonly fb = inject(FormBuilder);

  readonly categories = AUDIT_CATEGORIES;
  readonly actionsByCategory = AUDIT_ACTIONS_BY_CATEGORY;
  readonly formatDate = formatNotificationDateTime;
  readonly formatCategory = formatAuditCategoryLabel;
  readonly formatAction = formatAuditActionLabel;
  readonly formatEntity = formatAuditEntity;
  readonly pillClass = categoryPillModifier;

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly rows = signal<AuditLogListItem[]>([]);
  readonly skip = signal(0);
  readonly hasMore = signal(false);

  readonly filterForm = this.fb.nonNullable.group({
    fromDate: [''],
    toDate: [''],
    category: [''],
    action: [''],
    entityType: [''],
    entityId: [''],
    userId: ['']
  });

  private appliedQuery: AuditLogQuery = {};

  ngOnInit(): void {
    this.reload();
  }

  get actionOptions(): readonly string[] {
    const category = this.filterForm.controls.category.value as AuditCategory | '';
    if (category && category in this.actionsByCategory) {
      return this.actionsByCategory[category as AuditCategory];
    }
    return Object.values(this.actionsByCategory).flat();
  }

  onCategoryChange(): void {
    const action = this.filterForm.controls.action.value;
    if (action && !this.actionOptions.includes(action)) {
      this.filterForm.controls.action.setValue('');
    }
  }

  applyFilters(): void {
    this.appliedQuery = this.buildQueryFromForm();
    this.reload();
  }

  clearFilters(): void {
    this.filterForm.reset({
      fromDate: '',
      toDate: '',
      category: '',
      action: '',
      entityType: '',
      entityId: '',
      userId: ''
    });
    this.appliedQuery = {};
    this.reload();
  }

  reload(): void {
    this.skip.set(0);
    this.loadPage(false);
  }

  loadMore(): void {
    this.loadPage(true);
  }

  private buildQueryFromForm(): AuditLogQuery {
    const value = this.filterForm.getRawValue();
    const userIdRaw = value.userId.trim();
    const userId = userIdRaw === '' ? undefined : Number(userIdRaw);

    return {
      fromDate: toAuditFromDateUtc(value.fromDate),
      toDate: toAuditToDateUtc(value.toDate),
      category: value.category.trim() || undefined,
      action: value.action.trim() || undefined,
      entityType: value.entityType.trim() || undefined,
      entityId: value.entityId.trim() || undefined,
      userId: userId !== undefined && !Number.isNaN(userId) ? userId : undefined
    };
  }

  private loadPage(append: boolean): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    const skip = append ? this.skip() : 0;
    const query: AuditLogQuery = {
      ...this.appliedQuery,
      skip,
      take: AUDIT_PAGE_SIZE
    };

    this.api.getPlatformAuditLogs(query).subscribe({
      next: (data) => {
        const nextRows = append ? [...this.rows(), ...data] : data;
        this.rows.set(nextRows);
        this.skip.set(skip + data.length);
        this.hasMore.set(data.length >= AUDIT_PAGE_SIZE);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        if (!append) {
          this.rows.set([]);
        }
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load platform audit logs.'));
        this.loading.set(false);
      }
    });
  }
}
