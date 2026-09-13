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
import {
  InventoryItem,
  InventoryItemTypes,
  ItemBrand,
  ItemCategory
} from '../../models/inventory.models';
import { itemTypeLabel } from '../../utils/inventory-display.util';

@Component({
  selector: 'app-items-list',
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
  templateUrl: './items-list.component.html',
  styleUrl: './items-list.component.scss'
})
export class ItemListComponent implements OnInit {
  private readonly api = inject(InventoryApiService);
  private readonly fb = inject(FormBuilder);

  readonly permissionCodes = PermissionCodes;
  readonly itemTypes = InventoryItemTypes;
  readonly itemTypeLabel = itemTypeLabel;
  readonly loading = signal(true);
  readonly rows = signal<InventoryItem[]>([]);
  readonly categories = signal<ItemCategory[]>([]);
  readonly brands = signal<ItemBrand[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly statusBusyId = signal<number | null>(null);

  readonly filters = this.fb.nonNullable.group({
    categoryId: [null as number | null],
    brandId: [null as number | null],
    itemType: [''],
    isActive: [true]
  });

  ngOnInit(): void {
    this.api.getCategories({ isActive: true }).subscribe({
      next: (data) => this.categories.set(data),
      error: () => this.categories.set([])
    });
    this.api.getBrands({ isActive: true }).subscribe({
      next: (data) => this.brands.set(data),
      error: () => this.brands.set([])
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    const value = this.filters.getRawValue();
    this.api
      .getItems({
        isActive: value.isActive,
        categoryId: value.categoryId,
        brandId: value.brandId,
        itemType: value.itemType || null
      })
      .subscribe({
        next: (data) => {
          this.rows.set(data);
          this.loading.set(false);
        },
        error: (error) => {
          this.rows.set([]);
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load items.'));
          this.loading.set(false);
        }
      });
  }

  toggleStatus(row: InventoryItem): void {
    if (this.statusBusyId() != null) {
      return;
    }
    this.statusBusyId.set(row.itemId);
    this.errorMessage.set(null);
    this.api.setItemStatus(row.itemId, !row.isActive).subscribe({
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
