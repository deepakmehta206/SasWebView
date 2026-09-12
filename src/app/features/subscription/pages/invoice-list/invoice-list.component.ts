import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { SubscriptionSubnavComponent } from '../../components/subscription-subnav/subscription-subnav.component';
import { SubscriptionInvoiceDto } from '../../models/subscription.models';
import { SubscriptionService } from '../../services/subscription.service';
import { formatDate, formatMoney } from '../../utils/limit-display.util';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    SubscriptionSubnavComponent
  ],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss'
})
export class InvoiceListComponent implements OnInit {
  private readonly subscriptionService = inject(SubscriptionService);

  readonly formatDate = formatDate;
  readonly formatMoney = formatMoney;

  readonly loading = signal(true);
  readonly invoices = signal<SubscriptionInvoiceDto[]>([]);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.subscriptionService.getInvoices().subscribe({
      next: (data) => {
        this.invoices.set(data);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.invoices.set([]);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load invoices.'));
        this.loading.set(false);
      }
    });
  }
}
