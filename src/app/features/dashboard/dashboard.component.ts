import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../shared/components/ui-card/ui-card.component';

interface DashboardPlaceholderCard {
  title: string;
  value: string;
  hint: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PageHeaderComponent, UiCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  /**
   * UI placeholders only — not loaded from API.
   * Later phases will bind these to real backend data.
   */
  readonly cards: readonly DashboardPlaceholderCard[] = [
    {
      title: 'Total Users',
      value: '—',
      hint: 'User metrics will appear after authentication is enabled.'
    },
    {
      title: 'Active Modules',
      value: '—',
      hint: 'Module entitlements will come from the backend.'
    },
    {
      title: 'Subscription',
      value: '—',
      hint: 'Plan and status will be shown in a later phase.'
    },
    {
      title: 'Storage',
      value: '—',
      hint: 'Usage limits will sync from subscription entitlements.'
    }
  ];
}
