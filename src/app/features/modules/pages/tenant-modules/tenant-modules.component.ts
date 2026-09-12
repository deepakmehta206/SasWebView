import { Component, OnInit, inject, signal } from '@angular/core';
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
import { TenantModuleDto } from '../../models/module.model';
import { TenantModuleService } from '../../services/tenant-module.service';

@Component({
  selector: 'app-tenant-modules',
  standalone: true,
  imports: [
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective
  ],
  templateUrl: './tenant-modules.component.html',
  styleUrl: './tenant-modules.component.scss'
})
export class TenantModulesComponent implements OnInit {
  private readonly tenantModules = inject(TenantModuleService);
  private readonly tenantContext = inject(TenantContextService);
  private readonly coordinator = inject(FeatureAccessCoordinator);
  private readonly permissions = inject(PermissionService);

  readonly permissionCodes = PermissionCodes;
  readonly loading = signal(true);
  readonly savingId = signal<number | null>(null);
  readonly items = signal<TenantModuleDto[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly canEdit = () => this.permissions.hasPermission(PermissionCodes.TenantModuleEdit);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const tenantId = this.tenantContext.tenantId();
    this.loading.set(true);
    this.errorMessage.set(null);
    this.tenantModules.getList(tenantId).subscribe({
      next: (response) => {
        this.items.set(response.data ?? []);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.items.set([]);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load tenant modules.'));
        this.loading.set(false);
      }
    });
  }

  toggle(item: TenantModuleDto): void {
    if (item.isSystemModule) {
      this.errorMessage.set('System modules cannot be disabled.');
      return;
    }
    if (!this.canEdit()) {
      this.errorMessage.set('You do not have permission to change tenant modules.');
      return;
    }

    const nextEnabled = !item.isEnabled;
    const action = nextEnabled ? 'enable' : 'disable';
    if (!window.confirm(`${action === 'enable' ? 'Enable' : 'Disable'} module ${item.moduleCode}?`)) {
      return;
    }

    this.savingId.set(item.moduleId);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.tenantModules
      .setEnabled(this.tenantContext.tenantId(), item.moduleId, { isEnabled: nextEnabled })
      .subscribe({
        next: (response) => {
          const updated = response.data;
          if (updated) {
            this.items.set(
              this.items().map((row) => (row.moduleId === item.moduleId ? updated : row))
            );
          }
          this.successMessage.set(response.message || 'Tenant module updated.');
          this.savingId.set(null);
          this.coordinator.reloadAndGuardCurrentRoute();
        },
        error: (error: unknown) => {
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to update tenant module.'));
          this.savingId.set(null);
        }
      });
  }
}
