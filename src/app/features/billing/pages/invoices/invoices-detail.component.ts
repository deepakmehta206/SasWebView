import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { BranchContextService } from '../../../branch/services/branch-context.service';
import { MasterApiService } from '../../../masters/services/master-api.service';
import { BillingApiService } from '../../services/billing-api.service';
import {
  BillingCustomer,
  BillingInvoice,
  BillingPayment,
  BillingPaymentStatuses
} from '../../models/billing.models';
import {
  draftInvoiceNumberLabel,
  formatMoney,
  formatOutstanding,
  getInvoiceActions,
  invoiceStatusClass,
  invoiceStatusLabel,
  paymentStatusClass,
  paymentStatusLabel
} from '../../utils/billing-display.util';

@Component({
  selector: 'app-invoices-detail',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective
  ],
  templateUrl: './invoices-detail.component.html',
  styleUrl: './invoices-detail.component.scss'
})
export class InvoicesDetailComponent implements OnInit {
  private readonly api = inject(BillingApiService);
  private readonly masterApi = inject(MasterApiService);
  private readonly branchContext = inject(BranchContextService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly permissionCodes = PermissionCodes;
  readonly paymentStatuses = BillingPaymentStatuses;
  readonly draftInvoiceNumberLabel = draftInvoiceNumberLabel;
  readonly invoiceStatusLabel = invoiceStatusLabel;
  readonly invoiceStatusClass = invoiceStatusClass;
  readonly paymentStatusLabel = paymentStatusLabel;
  readonly paymentStatusClass = paymentStatusClass;
  readonly formatMoney = formatMoney;
  readonly formatOutstanding = formatOutstanding;
  readonly branches = this.branchContext.branches;
  readonly loading = signal(true);
  readonly acting = signal(false);
  readonly postingPayment = signal(false);
  readonly paymentBusyId = signal<number | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly invoice = signal<BillingInvoice | null>(null);
  readonly payments = signal<BillingPayment[]>([]);
  readonly customers = signal<BillingCustomer[]>([]);
  readonly paymentModes = signal<Array<{ paymentModeId: number; paymentModeName: string }>>([]);

  readonly paymentForm = this.fb.nonNullable.group({
    paymentDate: [new Date().toISOString().slice(0, 10), Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    paymentModeId: [0, [Validators.required, Validators.min(1)]],
    referenceNumber: [''],
    notes: ['']
  });

  readonly actions = computed(() => {
    const current = this.invoice();
    return current ? getInvoiceActions(current.status) : getInvoiceActions('');
  });

  ngOnInit(): void {
    if (!this.branchContext.branches().length) {
      this.branchContext.loadBranches();
    }
    this.api.getCustomers().subscribe({
      next: (data) => this.customers.set(data),
      error: () => this.customers.set([])
    });
    this.masterApi
      .getList<{ paymentModeId: number; paymentModeName: string }>('/payment-modes', { isActive: true })
      .subscribe({
        next: (data) => this.paymentModes.set(data),
        error: () => this.paymentModes.set([])
      });
    this.load();
  }

  load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.errorMessage.set(null);
    this.api.getInvoice(id).subscribe({
      next: (data) => {
        this.invoice.set(data);
        const outstanding = formatOutstanding(data.outstandingAmount, data.totalAmount, data.paidAmount);
        this.paymentForm.patchValue({ amount: outstanding > 0 ? outstanding : 0 });
        this.loading.set(false);
        this.loadPayments(id);
      },
      error: (error) => {
        this.invoice.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load invoice.'));
        this.loading.set(false);
      }
    });
  }

  loadPayments(invoiceId: number): void {
    this.api.getPayments({ invoiceId }).subscribe({
      next: (data) => this.payments.set(data),
      error: () => this.payments.set([])
    });
  }

  customerName(customerId: number): string {
    return this.customers().find((row) => row.customerId === customerId)?.customerName ?? String(customerId);
  }

  branchName(branchId: number): string {
    return this.branches().find((branch) => branch.branchId === branchId)?.branchName ?? String(branchId);
  }

  paymentModeName(paymentModeId: number): string {
    return (
      this.paymentModes().find((mode) => mode.paymentModeId === paymentModeId)?.paymentModeName ??
      String(paymentModeId)
    );
  }

  approve(): void {
    const current = this.invoice();
    if (!current || this.acting() || !this.actions().canApprove) {
      return;
    }
    if (!confirm('Approve this invoice?')) {
      return;
    }
    this.runInvoiceAction(() => this.api.approveInvoice(current.invoiceId));
  }

  cancel(): void {
    const current = this.invoice();
    if (!current || this.acting() || !this.actions().canCancel) {
      return;
    }
    if (!confirm('Cancel this invoice?')) {
      return;
    }
    this.runInvoiceAction(() => this.api.cancelInvoice(current.invoiceId));
  }

  edit(): void {
    const current = this.invoice();
    if (!current) {
      return;
    }
    void this.router.navigate(['/billing/invoices', current.invoiceId, 'edit']);
  }

  postPayment(): void {
    const current = this.invoice();
    if (!current || this.postingPayment() || !this.actions().canPay) {
      return;
    }
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    if (!confirm('Post this payment?')) {
      return;
    }
    const value = this.paymentForm.getRawValue();
    this.postingPayment.set(true);
    this.errorMessage.set(null);
    this.api
      .postPayment({
        invoiceId: current.invoiceId,
        paymentDate: value.paymentDate,
        amount: Number(value.amount),
        paymentModeId: Number(value.paymentModeId),
        referenceNumber: value.referenceNumber.trim() || null,
        notes: value.notes.trim() || null
      })
      .subscribe({
        next: () => {
          this.postingPayment.set(false);
          this.load();
        },
        error: (error) => {
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to post payment.'));
          this.postingPayment.set(false);
        }
      });
  }

  cancelPayment(payment: BillingPayment): void {
    if (this.paymentBusyId() != null || payment.status !== BillingPaymentStatuses.Posted) {
      return;
    }
    if (!confirm('Cancel this payment?')) {
      return;
    }
    this.paymentBusyId.set(payment.paymentId);
    this.errorMessage.set(null);
    this.api.cancelPayment(payment.paymentId).subscribe({
      next: () => {
        this.paymentBusyId.set(null);
        this.load();
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to cancel payment.'));
        this.paymentBusyId.set(null);
      }
    });
  }

  private runInvoiceAction(request: () => ReturnType<BillingApiService['approveInvoice']>): void {
    this.acting.set(true);
    this.errorMessage.set(null);
    request().subscribe({
      next: () => {
        this.acting.set(false);
        this.load();
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to update invoice.'));
        this.acting.set(false);
      }
    });
  }
}
