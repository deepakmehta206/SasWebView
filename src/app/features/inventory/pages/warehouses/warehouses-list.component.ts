import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { BranchContextService } from '../../../branch/services/branch-context.service';
import { InventoryApiService } from '../../services/inventory-api.service';
import { InventoryWarehouse } from '../../models/inventory.models';
import { warehouseTypeLabel } from '../../utils/inventory-display.util';

@Component({
  selector: 'app-warehouses-list',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective
  ],
  templateUrl: './warehouses-list.component.html',
  styleUrl: './warehouses-list.component.scss'
})
export class WarehouseListComponent implements OnInit {
  private readonly api = inject(InventoryApiService);
  private readonly branchContext = inject(BranchContextService);
  private readonly fb = inject(FormBuilder);

  readonly permissionCodes = PermissionCodes;
  readonly warehouseTypeLabel = warehouseTypeLabel;
  readonly branches = this.branchContext.branches;
  readonly loading = signal(true);
  readonly rows = signal<InventoryWarehouse[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly statusBusyId = signal<number | null>(null);

  readonly filters = this.fb.nonNullable.group({
    branchId: [null as number | null],
    isActive: [true]
  });

  ngOnInit(): void {
    if (!this.branchContext.branches().length) {
      this.branchContext.loadBranches();
    }
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    const value = this.filters.getRawValue();
    this.api
      .getWarehouses({
        branchId: value.branchId,
        isActive: value.isActive
      })
      .subscribe({
        next: (data) => {
          this.rows.set(data);
          this.loading.set(false);
        },
        error: (error) => {
          this.rows.set([]);
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load warehouses.'));
          this.loading.set(false);
        }
      });
  }

  toggleStatus(row: InventoryWarehouse): void {
    if (this.statusBusyId() != null) {
      return;
    }
    this.statusBusyId.set(row.warehouseId);
    this.errorMessage.set(null);
    this.api.setWarehouseStatus(row.warehouseId, !row.isActive).subscribe({
      next: () => {
        this.statusBusyId.set(null);
        this.load();
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to update status.'));
        this.statusBusyId.set(null);
      }
    });
  }
}
