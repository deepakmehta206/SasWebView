import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';
import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';
import { InventoryApiService } from '../../services/inventory-api.service';
import { ItemBrand } from '../../models/inventory.models';

@Component({
  selector: 'app-brands-list',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective
  ],
  templateUrl: './brands-list.component.html',
  styleUrl: './brands-list.component.scss'
})
export class BrandListComponent implements OnInit {
  private readonly api = inject(InventoryApiService);
  readonly permissionCodes = PermissionCodes;
  readonly loading = signal(true);
  readonly rows = signal<ItemBrand[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly statusBusyId = signal<number | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.api.getBrands().subscribe({
      next: (data) => {
        this.rows.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.rows.set([]);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load brands.'));
        this.loading.set(false);
      }
    });
  }

  toggleStatus(row: ItemBrand): void {
    if (this.statusBusyId() != null) {
      return;
    }
    this.statusBusyId.set(row.brandId);
    this.errorMessage.set(null);
    this.api.setBrandStatus(row.brandId, !row.isActive).subscribe({
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
