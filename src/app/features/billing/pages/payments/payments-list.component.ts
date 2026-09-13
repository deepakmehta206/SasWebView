import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { MasterApiService } from '../../../masters/services/master-api.service';
import { BillingApiService } from '../../services/billing-api.service';
import { BillingPayment } from '../../models/billing.models';
import { formatMoney, paymentStatusClass, paymentStatusLabel } from '../../utils/billing-display.util';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent
  ],
  templateUrl: './payments-list.component.html',
  styleUrl: './payments-list.component.scss'
})
export class PaymentsListComponent implements OnInit {
  private readonly api = inject(BillingApiService);
  private readonly masterApi = inject(MasterApiService);
  private readonly fb = inject(FormBuilder);

  readonly paymentStatusLabel = paymentStatusLabel;
  readonly paymentStatusClass = paymentStatusClass;
  readonly formatMoney = formatMoney;
  readonly loading = signal(true);
  readonly rows = signal<BillingPayment[]>([]);
  readonly paymentModes = signal<Array<{ paymentModeId: number; paymentModeName: string }>>([]);
  readonly errorMessage = signal<string | null>(null);

  readonly filters = this.fb.nonNullable.group({
    invoiceId: [null as number | null],
    fromDate: [''],
    toDate: ['']
  });

  ngOnInit(): void {
    this.masterApi
      .getList<{ paymentModeId: number; paymentModeName: string }>('/payment-modes', { isActive: true })
      .subscribe({
        next: (data) => this.paymentModes.set(data),
        error: () => this.paymentModes.set([])
      });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    const value = this.filters.getRawValue();
    this.api
      .getPayments({
        invoiceId: value.invoiceId,
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
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load payments.'));
          this.loading.set(false);
        }
      });
  }

  paymentModeName(paymentModeId: number): string {
    return (
      this.paymentModes().find((mode) => mode.paymentModeId === paymentModeId)?.paymentModeName ??
      String(paymentModeId)
    );
  }
}
