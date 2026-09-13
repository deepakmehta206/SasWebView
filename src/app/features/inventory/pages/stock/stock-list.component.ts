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
import { InventoryApiService } from '../../services/inventory-api.service';
import { InventoryWarehouse, WarehouseStock } from '../../models/inventory.models';
import { formatQuantity } from '../../utils/inventory-display.util';

@Component({
  selector: 'app-stock-list',
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
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.scss'
})
export class StockListComponent implements OnInit {
  private readonly api = inject(InventoryApiService);
  private readonly fb = inject(FormBuilder);

  readonly permissionCodes = PermissionCodes;
  readonly formatQuantity = formatQuantity;
  readonly loading = signal(true);
  readonly rows = signal<WarehouseStock[]>([]);
  readonly warehouses = signal<InventoryWarehouse[]>([]);
  readonly errorMessage = signal<string | null>(null);

  readonly filters = this.fb.nonNullable.group({
    warehouseId: [null as number | null],
    lowStockOnly: [false]
  });

  ngOnInit(): void {
    this.api.getWarehouses({ isActive: true }).subscribe({
      next: (data) => this.warehouses.set(data),
      error: () => this.warehouses.set([])
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    const value = this.filters.getRawValue();
    this.api
      .getStock({
        warehouseId: value.warehouseId,
        lowStockOnly: value.lowStockOnly || null,
        isActive: true
      })
      .subscribe({
        next: (data) => {
          this.rows.set(data);
          this.loading.set(false);
        },
        error: (error) => {
          this.rows.set([]);
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load stock.'));
          this.loading.set(false);
        }
      });
  }
}
