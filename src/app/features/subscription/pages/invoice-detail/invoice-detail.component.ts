import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    SubscriptionSubnavComponent
  ],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.scss'
})
export class InvoiceDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly subscriptionService = inject(SubscriptionService);

  readonly formatDate = formatDate;
  readonly formatMoney = formatMoney;

  readonly loading = signal(true);
  readonly invoice = signal<SubscriptionInvoiceDto | null>(null);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || id <= 0) {
      this.errorMessage.set('Invalid invoice id.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.subscriptionService.getInvoiceById(id).subscribe({
      next: (data) => {
        this.invoice.set(data);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.invoice.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load invoice.'));
        this.loading.set(false);
      }
    });
  }
}
