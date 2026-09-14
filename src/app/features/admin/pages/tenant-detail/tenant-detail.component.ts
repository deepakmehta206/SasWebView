import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { formatNotificationDateTime } from '../../../../core/notifications/notification-display.util';
import { PlatformTenantDetail } from '../../models/admin.models';
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
  selector: 'app-tenant-detail',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './tenant-detail.component.html',
  styleUrl: './tenant-detail.component.scss'
})
export class TenantDetailComponent implements OnInit {
  private readonly api = inject(AdminTenantsApiService);
  private readonly route = inject(ActivatedRoute);

  readonly formatDate = formatNotificationDateTime;
  readonly formatStatus = formatTenantStatus;
  readonly formatType = formatTenantType;
  readonly formatSubscription = formatSubscriptionStatus;
  readonly statusClass = tenantStatusClass;
  readonly dash = dash;
  readonly canActivate = canActivateTenant;
  readonly canSuspend = canSuspendTenant;

  readonly loading = signal(true);
  readonly acting = signal(false);
  readonly tenant = signal<PlatformTenantDetail | null>(null);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || Number.isNaN(id)) {
      this.tenant.set(null);
      this.errorMessage.set('Tenant was not found.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.api.getTenant(id).subscribe({
      next: (data) => {
        this.tenant.set(data);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.tenant.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load tenant.'));
        this.loading.set(false);
      }
    });
  }

  activate(): void {
    const current = this.tenant();
    if (!current || this.acting()) {
      return;
    }
    if (!confirm(`Activate tenant "${current.tenantName}"?`)) {
      return;
    }
    this.acting.set(true);
    this.errorMessage.set(null);
    this.api.activateTenant(current.tenantId).subscribe({
      next: () => {
        this.acting.set(false);
        this.load();
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to activate tenant.'));
        this.acting.set(false);
      }
    });
  }

  suspend(): void {
    const current = this.tenant();
    if (!current || this.acting()) {
      return;
    }
    if (!confirm(`Suspend tenant "${current.tenantName}"?`)) {
      return;
    }
    this.acting.set(true);
    this.errorMessage.set(null);
    this.api.suspendTenant(current.tenantId).subscribe({
      next: () => {
        this.acting.set(false);
        this.load();
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to suspend tenant.'));
        this.acting.set(false);
      }
    });
  }
}
