import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
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
  InventorySupplier,
  InventoryWarehouse,
  PurchaseOrder
} from '../../models/inventory.models';
import {
  formatMoney,
  formatQuantity,
  getPurchaseOrderActions,
  purchaseOrderStatusLabel,
  purchaseOrderStatusModifier,
  remainingQuantity
} from '../../utils/inventory-display.util';

@Component({
  selector: 'app-purchase-orders-detail',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent,
    EmptyStateComponent,
    HasPermissionDirective
  ],
  templateUrl: './purchase-orders-detail.component.html',
  styleUrl: './purchase-orders-detail.component.scss'
})
export class PurchaseOrderDetailComponent implements OnInit {
  private readonly api = inject(InventoryApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly permissionCodes = PermissionCodes;
  readonly purchaseOrderStatusLabel = purchaseOrderStatusLabel;
  readonly purchaseOrderStatusModifier = purchaseOrderStatusModifier;
  readonly formatQuantity = formatQuantity;
  readonly formatMoney = formatMoney;
  readonly remainingQuantity = remainingQuantity;
  readonly loading = signal(true);
  readonly acting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly order = signal<PurchaseOrder | null>(null);
  readonly suppliers = signal<InventorySupplier[]>([]);
  readonly warehouses = signal<InventoryWarehouse[]>([]);
  readonly items = signal<InventoryItem[]>([]);

  readonly actions = computed(() => {
    const current = this.order();
    return current ? getPurchaseOrderActions(current.status) : getPurchaseOrderActions('');
  });

  ngOnInit(): void {
    this.api.getSuppliers().subscribe({
      next: (data) => this.suppliers.set(data),
      error: () => this.suppliers.set([])
    });
    this.api.getWarehouses().subscribe({
      next: (data) => this.warehouses.set(data),
      error: () => this.warehouses.set([])
    });
    this.api.getItems().subscribe({
      next: (data) => this.items.set(data),
      error: () => this.items.set([])
    });
    this.load();
  }

  load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.errorMessage.set(null);
    this.api.getPurchaseOrder(id).subscribe({
      next: (data) => {
        this.order.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.order.set(null);
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load purchase order.'));
        this.loading.set(false);
      }
    });
  }

  supplierName(supplierId: number): string {
    return this.suppliers().find((row) => row.supplierId === supplierId)?.supplierName ?? String(supplierId);
  }

  warehouseName(warehouseId: number | null): string {
    if (warehouseId == null) {
      return '—';
    }
    return this.warehouses().find((row) => row.warehouseId === warehouseId)?.warehouseName ?? String(warehouseId);
  }

  itemLabel(itemId: number): string {
    const item = this.items().find((row) => row.itemId === itemId);
    return item ? `${item.itemCode} — ${item.itemName}` : String(itemId);
  }

  approve(): void {
    const current = this.order();
    if (!current || this.acting() || !this.actions().canApprove) {
      return;
    }
    if (!confirm('Approve this purchase order?')) {
      return;
    }
    this.runAction(() => this.api.approvePurchaseOrder(current.purchaseOrderId));
  }

  cancel(): void {
    const current = this.order();
    if (!current || this.acting() || !this.actions().canCancel) {
      return;
    }
    if (!confirm('Cancel this purchase order?')) {
      return;
    }
    this.runAction(() => this.api.cancelPurchaseOrder(current.purchaseOrderId));
  }

  close(): void {
    const current = this.order();
    if (!current || this.acting() || !this.actions().canClose) {
      return;
    }
    if (!confirm('Close this purchase order?')) {
      return;
    }
    this.runAction(() => this.api.closePurchaseOrder(current.purchaseOrderId));
  }

  receive(): void {
    const current = this.order();
    if (!current || !this.actions().canReceive) {
      return;
    }
    void this.router.navigate(['/inventory/goods-receipts/new'], {
      queryParams: { purchaseOrderId: current.purchaseOrderId }
    });
  }

  private runAction(request: () => ReturnType<InventoryApiService['approvePurchaseOrder']>): void {
    this.acting.set(true);
    this.errorMessage.set(null);
    request().subscribe({
      next: () => {
        this.acting.set(false);
        this.load();
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to update purchase order.'));
        this.acting.set(false);
      }
    });
  }
}
