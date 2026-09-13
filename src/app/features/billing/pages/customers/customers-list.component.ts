import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { BranchContextService } from '../../../branch/services/branch-context.service';
import { BillingApiService } from '../../services/billing-api.service';
import { BillingCustomer } from '../../models/billing.models';
import { customerTypeLabel } from '../../utils/billing-display.util';

@Component({
  selector: 'app-customers-list',
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
  templateUrl: './customers-list.component.html',
  styleUrl: './customers-list.component.scss'
})
export class CustomersListComponent implements OnInit {
  private readonly api = inject(BillingApiService);
  private readonly branchContext = inject(BranchContextService);
  private readonly fb = inject(FormBuilder);

  readonly permissionCodes = PermissionCodes;
  readonly customerTypeLabel = customerTypeLabel;
  readonly branches = this.branchContext.branches;
  readonly loading = signal(true);
  readonly rows = signal<BillingCustomer[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly statusBusyId = signal<number | null>(null);

  readonly filters = this.fb.nonNullable.group({
    isActive: [null as boolean | null],
    branchId: [null as number | null]
  });

  ngOnInit(): void {
    if (!this.branchContext.branches().length) {
      this.branchContext.loadBranches();
    }
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    const value = this.filters.getRawValue();
    this.api
      .getCustomers({
        isActive: value.isActive,
        branchId: value.branchId
      })
      .subscribe({
        next: (data) => {
          this.rows.set(data);
          this.loading.set(false);
        },
        error: (error) => {
          this.rows.set([]);
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load customers.'));
          this.loading.set(false);
        }
      });
  }

  branchName(branchId: number | null): string {
    if (branchId == null) {
      return '—';
    }
    return this.branches().find((branch) => branch.branchId === branchId)?.branchName ?? String(branchId);
  }

  toggleStatus(row: BillingCustomer): void {
    if (this.statusBusyId() != null) {
      return;
    }
    const action = row.isActive ? 'deactivate' : 'activate';
    if (!confirm(`${action.charAt(0).toUpperCase()}${action.slice(1)} customer "${row.customerName}"?`)) {
      return;
    }
    this.statusBusyId.set(row.customerId);
    this.errorMessage.set(null);
    this.api.setCustomerStatus(row.customerId, { isActive: !row.isActive }).subscribe({
      next: () => {
        this.statusBusyId.set(null);
        this.load();
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to update status.'));
        this.statusBusyId.set(null);
      }
    });
  }
}
