import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { SubscriptionSubnavComponent } from '../../components/subscription-subnav/subscription-subnav.component';
import {
  SubscriptionLimitsDto,
  TenantUsageDto
} from '../../models/subscription.models';
import { SubscriptionService } from '../../services/subscription.service';
import { formatLimit, formatStorageMb } from '../../utils/limit-display.util';

@Component({
  selector: 'app-subscription-usage',
  standalone: true,
  imports: [
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    SubscriptionSubnavComponent
  ],
  templateUrl: './subscription-usage.component.html',
  styleUrl: './subscription-usage.component.scss'
})
export class SubscriptionUsageComponent implements OnInit {
  private readonly subscriptionService = inject(SubscriptionService);

  readonly formatLimit = formatLimit;
  readonly formatStorageMb = formatStorageMb;

  readonly loading = signal(true);
  readonly usage = signal<TenantUsageDto | null>(null);
  readonly limits = signal<SubscriptionLimitsDto | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly rows = computed(() => {
    const limits = this.limits();
    const usage = this.usage();
    if (!limits && !usage) {
      return [];
    }

    return [
      {
        label: 'Users',
        used: limits?.activeUsers ?? usage?.activeUsers ?? 0,
        max: limits?.maxUsers ?? null,
        allowed: limits?.canCreateUser ?? null
      },
      {
        label: 'Branches',
        used: limits?.branches ?? usage?.branches ?? 0,
        max: limits?.maxBranches ?? null,
        allowed: limits?.canCreateBranch ?? null
      },
      {
        label: 'Storage (MB)',
        used: limits?.storageUsedMB ?? usage?.storageUsedMB ?? 0,
        max: limits?.maxStorageMB ?? null,
        allowed: null as boolean | null
      }
    ];
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      usage: this.subscriptionService.getUsage(),
      limits: this.subscriptionService.getLimits()
    }).subscribe({
      next: ({ usage, limits }) => {
        this.usage.set(usage);
        this.limits.set(limits);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.usage.set(null);
        this.limits.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load usage.'));
        this.loading.set(false);
      }
    });
  }

  percent(used: number, max: number | null): string {
    if (max == null || max <= 0) {
      return 'Unlimited';
    }
    return `${Math.min(100, Math.round((used / max) * 100))}%`;
  }
}
