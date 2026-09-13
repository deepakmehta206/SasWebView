import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
@Component({
  selector: 'app-billing-hub',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, UiCardComponent],
  templateUrl: './billing-hub.component.html',
  styleUrl: './billing-hub.component.scss'
})
export class BillingHubComponent {
  readonly mainLinks = [
    {
      title: 'Customers',
      description: 'Billing customers and contact details.',
      route: '/billing/customers'
    },
    {
      title: 'Invoices',
      description: 'Create, approve, and manage invoices.',
      route: '/billing/invoices'
    },
    {
      title: 'Payments',
      description: 'Recorded payments against invoices.',
      route: '/billing/payments'
    }
  ] as const;
}
