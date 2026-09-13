import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';

import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';

import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';

import { InventoryApiService } from '../../services/inventory-api.service';

import {

  InventoryItem,

  InventoryPurchaseOrderStatuses,

  InventoryWarehouse,

  PurchaseOrder,

  PurchaseOrderDetail

} from '../../models/inventory.models';

import { formatQuantity, remainingQuantity } from '../../utils/inventory-display.util';



@Component({

  selector: 'app-goods-receipt-create',

  standalone: true,

  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    PageHeaderComponent,
    UiCardComponent,
    LoadingIndicatorComponent
  ],

  templateUrl: './goods-receipt-create.component.html',

  styleUrl: './goods-receipt-create.component.scss'

})

export class GoodsReceiptCreateComponent implements OnInit {

  private readonly api = inject(InventoryApiService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly fb = inject(FormBuilder);



  readonly formatQuantity = formatQuantity;

  readonly remainingQuantity = remainingQuantity;

  readonly loading = signal(true);

  readonly saving = signal(false);

  readonly errorMessage = signal<string | null>(null);

  readonly approvedOrders = signal<PurchaseOrder[]>([]);

  readonly warehouses = signal<InventoryWarehouse[]>([]);

  readonly items = signal<InventoryItem[]>([]);

  readonly selectedOrder = signal<PurchaseOrder | null>(null);



  readonly form = this.fb.nonNullable.group({

    purchaseOrderId: [0, [Validators.required, Validators.min(1)]],

    warehouseId: [0, [Validators.required, Validators.min(1)]],

    receiptDate: [new Date().toISOString().slice(0, 10), Validators.required],

    notes: [''],

    lines: this.fb.array([])

  });



  get lines(): FormArray {

    return this.form.controls.lines;

  }



  ngOnInit(): void {

    this.api.getWarehouses({ isActive: true }).subscribe({

      next: (data) => this.warehouses.set(data),

      error: () => this.warehouses.set([])

    });

    this.api.getItems({ isActive: true }).subscribe({

      next: (data) => this.items.set(data),

      error: () => this.items.set([])

    });

    this.api.getPurchaseOrders({ status: InventoryPurchaseOrderStatuses.Approved }).subscribe({

      next: (data) => {

        this.approvedOrders.set(data);

        this.loading.set(false);

        const queryId = Number(this.route.snapshot.queryParamMap.get('purchaseOrderId'));

        if (queryId) {

          this.form.patchValue({ purchaseOrderId: queryId });

          this.onPurchaseOrderChange(queryId);

        }

      },

      error: (error) => {

        this.approvedOrders.set([]);

        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load purchase orders.'));

        this.loading.set(false);

      }

    });

  }



  onPurchaseOrderChange(purchaseOrderId: number): void {

    if (!purchaseOrderId) {

      this.selectedOrder.set(null);

      this.lines.clear();

      return;

    }

    this.loading.set(true);

    this.api.getPurchaseOrder(purchaseOrderId).subscribe({

      next: (order) => {

        this.selectedOrder.set(order);

        if (order.warehouseId) {

          this.form.patchValue({ warehouseId: order.warehouseId });

        }

        this.lines.clear();

        for (const detail of order.details ?? []) {

          const remaining = remainingQuantity(detail.quantityOrdered, detail.receivedQuantity);

          if (remaining <= 0) {

            continue;

          }

          this.lines.push(this.createLineGroup(detail, remaining));

        }

        this.loading.set(false);

      },

      error: (error) => {

        this.selectedOrder.set(null);

        this.lines.clear();

        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load purchase order.'));

        this.loading.set(false);

      }

    });

  }



  createLineGroup(detail: PurchaseOrderDetail, remaining: number) {

    return this.fb.nonNullable.group({

      purchaseOrderDetailId: [detail.purchaseOrderDetailId, Validators.required],

      itemId: [detail.itemId],

      quantityOrdered: [detail.quantityOrdered],

      receivedQuantity: [detail.receivedQuantity],

      remaining: [remaining],

      quantityReceived: [remaining, [Validators.required, Validators.min(0.0001), Validators.max(remaining)]],

      unitCost: [detail.unitCost, [Validators.required, Validators.min(0)]]

    });

  }



  itemLabel(itemId: number): string {

    const item = this.items().find((row) => row.itemId === itemId);

    return item ? `${item.itemCode} — ${item.itemName}` : String(itemId);

  }



  submit(): void {

    if (this.form.invalid || this.saving() || !this.lines.length) {

      this.form.markAllAsTouched();

      if (!this.lines.length) {

        this.errorMessage.set('No receivable lines on the selected purchase order.');

      }

      return;

    }

    if (!confirm('Submit this goods receipt?')) {

      return;

    }



    this.saving.set(true);

    this.errorMessage.set(null);

    const value = this.form.getRawValue();

    this.api

      .createGoodsReceipt({

        purchaseOrderId: Number(value.purchaseOrderId),

        warehouseId: Number(value.warehouseId),

        receiptDate: value.receiptDate,

        notes: value.notes.trim() || null,

        lines: (
          value.lines as Array<{
            purchaseOrderDetailId: number;
            quantityReceived: number;
            unitCost: number;
          }>
        ).map((line) => ({
          purchaseOrderDetailId: Number(line.purchaseOrderDetailId),
          quantityReceived: Number(line.quantityReceived),
          unitCost: Number(line.unitCost)
        }))

      })

      .subscribe({

        next: () => {

          this.saving.set(false);

          void this.router.navigate(['/inventory/purchase-orders', value.purchaseOrderId]);

        },

        error: (error) => {

          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to create goods receipt.'));

          this.saving.set(false);

        }

      });

  }

}

