import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { EntitlementService } from '../../../../core/entitlements/entitlement.service';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { SubscriptionSubnavComponent } from '../../components/subscription-subnav/subscription-subnav.component';
import { TenantSubscriptionDto } from '../../models/subscription.models';
import { SubscriptionService } from '../../services/subscription.service';
import {
  formatDate,
  formatLimit,
  formatStorageMb
} from '../../utils/limit-display.util';

@Component({
  selector: 'app-subscription-hub',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective,
    SubscriptionSubnavComponent
  ],
  templateUrl: './subscription-hub.component.html',
  styleUrl: './subscription-hub.component.scss'
})
export class SubscriptionHubComponent implements OnInit {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly entitlementService = inject(EntitlementService);

  readonly permissionCodes = PermissionCodes;
  readonly formatLimit = formatLimit;
  readonly formatStorageMb = formatStorageMb;
  readonly formatDate = formatDate;

  readonly loading = signal(true);
  readonly actionBusy = signal(false);
  readonly subscription = signal<TenantSubscriptionDto | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly infoMessage = signal<string | null>(null);

  readonly cancelForm = new FormGroup({
    reason: new FormControl('', { nonNullable: true }),
    preserveAccessUntilPeriodEnd: new FormControl(true, { nonNullable: true })
  });

  readonly renewForm = new FormGroup({
    billingCycle: new FormControl('', { nonNullable: true })
  });

  readonly links = [
    {
      title: 'Plans',
      description: 'Compare available plans and change your subscription.',
      route: '/subscription/plans',
      permission: PermissionCodes.PlanView
    },
    {
      title: 'Usage & limits',
      description: 'See current usage against plan limits.',
      route: '/subscription/usage',
      permission: PermissionCodes.SubscriptionView
    },
    {
      title: 'Invoices',
      description: 'View billing invoices for this tenant.',
      route: '/subscription/invoices',
      permission: PermissionCodes.SubscriptionView
    }
  ] as const;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.subscriptionService.getCurrent().subscribe({
      next: (data) => {
        this.subscription.set(data);
        this.renewForm.patchValue({
          billingCycle: data.billingCycle || ''
        });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.subscription.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load subscription.'));
        this.loading.set(false);
      }
    });
  }

  entitlementsSummary(): string {
    const entitlements = this.entitlementService.entitlements();
    if (!entitlements) {
      return '—';
    }
    return `${entitlements.planCode ?? '—'} · ${entitlements.subscriptionStatus ?? '—'}`;
  }

  hasPendingDowngrade(sub: TenantSubscriptionDto): boolean {
    return sub.pendingPlanId != null;
  }

  cancel(): void {
    if (this.actionBusy()) {
      return;
    }

    this.actionBusy.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.infoMessage.set(null);

    const value = this.cancelForm.getRawValue();
    this.subscriptionService
      .cancel({
        reason: value.reason.trim() || null,
        preserveAccessUntilPeriodEnd: value.preserveAccessUntilPeriodEnd
      })
      .subscribe({
        next: (result) => {
          this.subscription.set(result.subscription ?? this.subscriptionService.current());
          this.successMessage.set(result.message ?? 'Subscription cancelled.');
          this.actionBusy.set(false);
        },
        error: (error: unknown) => {
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to cancel subscription.'));
          this.actionBusy.set(false);
        }
      });
  }

  renew(): void {
    if (this.actionBusy()) {
      return;
    }

    this.actionBusy.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.infoMessage.set(null);

    const cycle = this.renewForm.controls.billingCycle.value.trim();
    this.subscriptionService
      .renew({
        billingCycle: cycle || null
      })
      .subscribe({
        next: (result) => {
          this.subscription.set(result.subscription ?? this.subscriptionService.current());
          this.successMessage.set(result.message ?? 'Subscription renewed.');
          this.actionBusy.set(false);
        },
        error: (error: unknown) => {
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to renew subscription.'));
          this.actionBusy.set(false);
        }
      });
  }
}
