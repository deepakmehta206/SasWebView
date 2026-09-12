import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { SubscriptionSubnavComponent } from '../../components/subscription-subnav/subscription-subnav.component';
import { PlanDto, TenantSubscriptionDto } from '../../models/subscription.models';
import { PlanService } from '../../services/plan.service';
import { SubscriptionService } from '../../services/subscription.service';
import {
  formatLimit,
  formatMoney,
  formatStorageMb
} from '../../utils/limit-display.util';

type PlanAction = 'upgrade' | 'downgrade' | 'current';

@Component({
  selector: 'app-plan-catalog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective,
    SubscriptionSubnavComponent
  ],
  templateUrl: './plan-catalog.component.html',
  styleUrl: './plan-catalog.component.scss'
})
export class PlanCatalogComponent implements OnInit {
  private readonly planService = inject(PlanService);
  private readonly subscriptionService = inject(SubscriptionService);

  readonly permissionCodes = PermissionCodes;
  readonly formatLimit = formatLimit;
  readonly formatStorageMb = formatStorageMb;
  readonly formatMoney = formatMoney;

  readonly loading = signal(true);
  readonly actionBusyPlanId = signal<number | null>(null);
  readonly plans = signal<PlanDto[]>([]);
  readonly subscription = signal<TenantSubscriptionDto | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly infoMessage = signal<string | null>(null);

  readonly changeForm = new FormGroup({
    billingCycle: new FormControl('MONTHLY', { nonNullable: true }),
    reason: new FormControl('', { nonNullable: true })
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      plans: this.planService.getList(false),
      subscription: this.subscriptionService.getCurrent()
    }).subscribe({
      next: ({ plans, subscription }) => {
        this.plans.set(plans);
        this.subscription.set(subscription);
        this.changeForm.patchValue({
          billingCycle: subscription.billingCycle || 'MONTHLY'
        });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.plans.set([]);
        this.subscription.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load plans.'));
        this.loading.set(false);
      }
    });
  }

  resolveAction(plan: PlanDto): PlanAction {
    const current = this.subscription();
    if (!current || current.planId === plan.planId) {
      return 'current';
    }

    const currentPlan = this.plans().find((item) => item.planId === current.planId);
    const currentRank = planRank(currentPlan ?? null, current);
    const targetRank = planRank(plan, null);
    return targetRank < currentRank ? 'downgrade' : 'upgrade';
  }

  changePlan(plan: PlanDto): void {
    const action = this.resolveAction(plan);
    if (action === 'current' || this.actionBusyPlanId() != null) {
      return;
    }

    this.actionBusyPlanId.set(plan.planId);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.infoMessage.set(null);

    const form = this.changeForm.getRawValue();
    const request = {
      targetPlanId: plan.planId,
      billingCycle: form.billingCycle || null,
      reason: form.reason.trim() || null
    };

    const request$ =
      action === 'upgrade'
        ? this.subscriptionService.upgrade(request)
        : this.subscriptionService.downgrade(request);

    request$.subscribe({
      next: (result) => {
        this.subscription.set(result.subscription ?? this.subscriptionService.current());
        if (result.scheduledDowngrade) {
          this.infoMessage.set(
            result.message ??
              'Downgrade scheduled for the next billing period. Current access is unchanged.'
          );
        } else {
          this.successMessage.set(result.message ?? 'Subscription updated.');
        }
        this.actionBusyPlanId.set(null);
      },
      error: (error: unknown) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to change plan.'));
        this.actionBusyPlanId.set(null);
      }
    });
  }
}

function planRank(
  plan: PlanDto | null,
  subscription: TenantSubscriptionDto | null
): number {
  const maxUsers = plan?.maxUsers ?? subscription?.maxUsers ?? null;
  const maxBranches = plan?.maxBranches ?? subscription?.maxBranches ?? null;
  const maxStorageMB = plan?.maxStorageMB ?? subscription?.maxStorageMB ?? null;
  const monthlyPrice = plan?.monthlyPrice ?? 0;

  if (maxUsers == null && maxBranches == null && maxStorageMB == null) {
    return Math.floor(Number.MAX_SAFE_INTEGER / 2) + Math.min(monthlyPrice, Number.MAX_SAFE_INTEGER / 4);
  }

  return Math.min(monthlyPrice, Number.MAX_SAFE_INTEGER / 2);
}
