import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { formatNotificationDateTime } from '../../../../core/notifications/notification-display.util';
import { PlatformTenantListItem } from '../../models/admin.models';
import { AdminTenantsApiService } from '../../services/admin-tenants-api.service';
import {
  canActivateTenant,
  canSuspendTenant,
  dash,
  formatSubscriptionStatus,
  formatTenantStatus,
  formatTenantType,
  tenantStatusClass
} from '../../utils/admin-display.util';

@Component({
  selector: 'app-tenants-list',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './tenants-list.component.html',
  styleUrl: './tenants-list.component.scss'
})
export class TenantsListComponent implements OnInit {
  private readonly api = inject(AdminTenantsApiService);

  readonly formatDate = formatNotificationDateTime;
  readonly formatStatus = formatTenantStatus;
  readonly formatType = formatTenantType;
  readonly formatSubscription = formatSubscriptionStatus;
  readonly statusClass = tenantStatusClass;
  readonly dash = dash;
  readonly canActivate = canActivateTenant;
  readonly canSuspend = canSuspendTenant;

  readonly loading = signal(true);
  readonly rows = signal<PlatformTenantListItem[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly statusBusyId = signal<number | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.api.getTenants().subscribe({
      next: (data) => {
        this.rows.set(data);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.rows.set([]);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load tenants.'));
        this.loading.set(false);
      }
    });
  }

  activate(row: PlatformTenantListItem): void {
    if (this.statusBusyId() != null) {
      return;
    }
    if (!confirm(`Activate tenant "${row.tenantName}"?`)) {
      return;
    }
    this.statusBusyId.set(row.tenantId);
    this.errorMessage.set(null);
    this.api.activateTenant(row.tenantId).subscribe({
      next: () => {
        this.statusBusyId.set(null);
        this.load();
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to activate tenant.'));
        this.statusBusyId.set(null);
      }
    });
  }

  suspend(row: PlatformTenantListItem): void {
    if (this.statusBusyId() != null) {
      return;
    }
    if (!confirm(`Suspend tenant "${row.tenantName}"?`)) {
      return;
    }
    this.statusBusyId.set(row.tenantId);
    this.errorMessage.set(null);
    this.api.suspendTenant(row.tenantId).subscribe({
      next: () => {
        this.statusBusyId.set(null);
        this.load();
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to suspend tenant.'));
        this.statusBusyId.set(null);
      }
    });
  }
}
