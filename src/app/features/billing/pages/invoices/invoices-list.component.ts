import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
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
import { BillingCustomer, BillingInvoice, BillingInvoiceStatuses } from '../../models/billing.models';
import {
  draftInvoiceNumberLabel,
  formatMoney,
  invoiceStatusClass,
  invoiceStatusLabel
} from '../../utils/billing-display.util';

@Component({
  selector: 'app-invoices-list',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective
  ],
  templateUrl: './invoices-list.component.html',
  styleUrl: './invoices-list.component.scss'
})
export class InvoicesListComponent implements OnInit {
  private readonly api = inject(BillingApiService);
  private readonly branchContext = inject(BranchContextService);
  private readonly fb = inject(FormBuilder);

  readonly permissionCodes = PermissionCodes;
  readonly statuses = BillingInvoiceStatuses;
  readonly invoiceStatusLabel = invoiceStatusLabel;
  readonly invoiceStatusClass = invoiceStatusClass;
  readonly draftInvoiceNumberLabel = draftInvoiceNumberLabel;
  readonly formatMoney = formatMoney;
  readonly branches = this.branchContext.branches;
  readonly loading = signal(true);
  readonly rows = signal<BillingInvoice[]>([]);
  readonly customers = signal<BillingCustomer[]>([]);
  readonly errorMessage = signal<string | null>(null);

  readonly filters = this.fb.nonNullable.group({
    customerId: [null as number | null],
    status: [''],
    branchId: [null as number | null],
    fromDate: [''],
    toDate: ['']
  });

  ngOnInit(): void {
    if (!this.branchContext.branches().length) {
      this.branchContext.loadBranches();
    }
    this.api.getCustomers({ isActive: true }).subscribe({
      next: (data) => this.customers.set(data),
      error: () => this.customers.set([])
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    const value = this.filters.getRawValue();
    this.api
      .getInvoices({
        customerId: value.customerId,
        status: value.status || null,
        branchId: value.branchId,
        fromDate: value.fromDate || null,
        toDate: value.toDate || null
      })
      .subscribe({
        next: (data) => {
          this.rows.set(data);
          this.loading.set(false);
        },
        error: (error) => {
          this.rows.set([]);
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load invoices.'));
          this.loading.set(false);
        }
      });
  }

  customerName(customerId: number): string {
    return this.customers().find((row) => row.customerId === customerId)?.customerName ?? String(customerId);
  }
}
