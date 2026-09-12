import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { PermissionService } from '../../../../core/permissions/permission.service';
import { FeatureAccessCoordinator } from '../../../../core/entitlements/feature-access-coordinator.service';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { TenantContextService } from '../../../tenant/services/tenant-context.service';
import { TenantFeatureDto } from '../../models/feature.model';
import { TenantFeatureService } from '../../services/tenant-feature.service';

@Component({
  selector: 'app-tenant-features',
  standalone: true,
  imports: [
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective
  ],
  templateUrl: './tenant-features.component.html',
  styleUrl: './tenant-features.component.scss'
})
export class TenantFeaturesComponent implements OnInit {
  private readonly tenantFeatures = inject(TenantFeatureService);
  private readonly tenantContext = inject(TenantContextService);
  private readonly coordinator = inject(FeatureAccessCoordinator);
  private readonly permissions = inject(PermissionService);

  readonly permissionCodes = PermissionCodes;
  readonly loading = signal(true);
  readonly savingId = signal<number | null>(null);
  readonly items = signal<TenantFeatureDto[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly grouped = computed(() => {
    const map = new Map<string, TenantFeatureDto[]>();
    for (const item of this.items()) {
      const key = item.moduleCode || 'UNKNOWN';
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([moduleCode, features]) => ({
        moduleCode,
        moduleName: features[0]?.moduleName ?? moduleCode,
        features: features.sort((a, b) => a.featureCode.localeCompare(b.featureCode))
      }));
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.tenantFeatures.getList(this.tenantContext.tenantId()).subscribe({
      next: (response) => {
        this.items.set(response.data ?? []);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.items.set([]);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load tenant features.'));
        this.loading.set(false);
      }
    });
  }

  toggle(item: TenantFeatureDto): void {
    if (!this.permissions.hasPermission(PermissionCodes.TenantFeatureEdit)) {
      this.errorMessage.set('You do not have permission to change tenant features.');
      return;
    }

    const nextEnabled = !item.isEnabled;
    if (!window.confirm(`${nextEnabled ? 'Enable' : 'Disable'} feature ${item.featureCode}?`)) {
      return;
    }

    this.savingId.set(item.featureId);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.tenantFeatures
      .setEnabled(this.tenantContext.tenantId(), item.featureId, { isEnabled: nextEnabled })
      .subscribe({
        next: (response) => {
          const updated = response.data;
          if (updated) {
            this.items.set(
              this.items().map((row) => (row.featureId === item.featureId ? updated : row))
            );
          }
          this.successMessage.set(response.message || 'Tenant feature updated.');
          this.savingId.set(null);
          this.coordinator.reloadAndGuardCurrentRoute();
        },
        error: (error: unknown) => {
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to update tenant feature.'));
          this.savingId.set(null);
        }
      });
  }
}
