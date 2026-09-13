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
import { ItemCategory } from '../../models/inventory.models';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective
  ],
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.scss'
})
export class CategoryListComponent implements OnInit {
  private readonly api = inject(InventoryApiService);
  readonly permissionCodes = PermissionCodes;
  readonly loading = signal(true);
  readonly rows = signal<ItemCategory[]>([]);
  readonly errorMessage = signal<string | null>(null);
  readonly statusBusyId = signal<number | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.api.getCategories().subscribe({
      next: (data) => {
        this.rows.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.rows.set([]);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load categories.'));
        this.loading.set(false);
      }
    });
  }

  toggleStatus(row: ItemCategory): void {
    if (this.statusBusyId() != null) {
      return;
    }
    this.statusBusyId.set(row.categoryId);
    this.errorMessage.set(null);
    this.api.setCategoryStatus(row.categoryId, !row.isActive).subscribe({
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
