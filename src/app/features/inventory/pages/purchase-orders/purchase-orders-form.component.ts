import { Component, OnInit, inject, signal } from '@angular/core';
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
  InventorySupplier,
  InventoryWarehouse
} from '../../models/inventory.models';
import { isStockableItemType } from '../../utils/inventory-display.util';

@Component({
  selector: 'app-purchase-orders-form',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent, LoadingIndicatorComponent],
  templateUrl: './purchase-orders-form.component.html',
  styleUrl: './purchase-orders-form.component.scss'
})
export class PurchaseOrderFormComponent implements OnInit {
  private readonly api = inject(InventoryApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEdit = signal(false);
  readonly suppliers = signal<InventorySupplier[]>([]);
  readonly warehouses = signal<InventoryWarehouse[]>([]);
  readonly items = signal<InventoryItem[]>([]);
  private id: number | null = null;

  readonly form = this.fb.nonNullable.group({
    supplierId: [0, [Validators.required, Validators.min(1)]],
    warehouseId: [null as number | null],
    orderNumber: [''],
    orderDate: [new Date().toISOString().slice(0, 10), Validators.required],
    notes: [''],
    lines: this.fb.array([this.createLineGroup()])
  });

  get lines(): FormArray {
    return this.form.controls.lines;
  }

  ngOnInit(): void {
    this.api.getSuppliers({ isActive: true }).subscribe({
      next: (data) => this.suppliers.set(data),
      error: () => this.suppliers.set([])
    });
    this.api.getWarehouses({ isActive: true }).subscribe({
      next: (data) => this.warehouses.set(data),
      error: () => this.warehouses.set([])
    });
    this.api.getItems({ isActive: true }).subscribe({
      next: (data) => this.items.set(data.filter((item) => isStockableItemType(item.itemType))),
      error: () => this.items.set([])
    });

    const raw = this.route.snapshot.paramMap.get('id');
    if (!raw) {
      return;
    }

    this.isEdit.set(true);
    this.id = Number(raw);
    this.loading.set(true);
    this.api.getPurchaseOrder(this.id).subscribe({
      next: (row) => {
        if (row.status !== InventoryPurchaseOrderStatuses.Draft) {
          void this.router.navigate(['/inventory/purchase-orders', this.id]);
          return;
        }
        this.form.patchValue({
          supplierId: row.supplierId,
          warehouseId: row.warehouseId,
          orderDate: row.orderDate.slice(0, 10),
          notes: row.notes ?? ''
        });
        this.lines.clear();
        for (const detail of row.details ?? []) {
          this.lines.push(
            this.createLineGroup({
              itemId: detail.itemId,
              quantityOrdered: detail.quantityOrdered,
              unitCost: detail.unitCost,
              notes: detail.notes
            })
          );
        }
        if (!this.lines.length) {
          this.lines.push(this.createLineGroup());
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load purchase order.'));
        this.loading.set(false);
      }
    });
  }

  createLineGroup(seed?: {
    itemId?: number;
    quantityOrdered?: number;
    unitCost?: number;
    notes?: string | null;
  }) {
    return this.fb.nonNullable.group({
      itemId: [seed?.itemId ?? 0, [Validators.required, Validators.min(1)]],
      quantityOrdered: [seed?.quantityOrdered ?? 0, [Validators.required, Validators.min(0.0001)]],
      unitCost: [seed?.unitCost ?? 0, [Validators.required, Validators.min(0)]],
      notes: [seed?.notes ?? '']
    });
  }

  addLine(): void {
    this.lines.push(this.createLineGroup());
  }

  removeLine(index: number): void {
    if (this.lines.length <= 1) {
      return;
    }
    this.lines.removeAt(index);
  }

  submit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);
    const value = this.form.getRawValue();
    const lines = value.lines.map((line) => ({
      itemId: Number(line.itemId),
      quantityOrdered: Number(line.quantityOrdered),
      unitCost: Number(line.unitCost),
      notes: line.notes.trim() || null
    }));

    if (this.isEdit()) {
      this.api
        .updatePurchaseOrder(this.id!, {
          supplierId: Number(value.supplierId),
          warehouseId: value.warehouseId ? Number(value.warehouseId) : null,
          orderDate: value.orderDate,
          notes: value.notes.trim() || null,
          lines
        })
        .subscribe({
          next: () => {
            this.saving.set(false);
            void this.router.navigate(['/inventory/purchase-orders', this.id]);
          },
          error: (error) => {
            this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save purchase order.'));
            this.saving.set(false);
          }
        });
      return;
    }

    this.api
      .createPurchaseOrder({
        supplierId: Number(value.supplierId),
        warehouseId: value.warehouseId ? Number(value.warehouseId) : null,
        orderNumber: value.orderNumber.trim() || null,
        orderDate: value.orderDate,
        notes: value.notes.trim() || null,
        lines
      })
      .subscribe({
        next: (created) => {
          this.saving.set(false);
          void this.router.navigate(['/inventory/purchase-orders', created.purchaseOrderId]);
        },
        error: (error) => {
          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to save purchase order.'));
          this.saving.set(false);
        }
      });
  }
}
