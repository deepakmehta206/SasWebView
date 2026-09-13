import { Component, OnInit, inject, signal } from '@angular/core';

import { Router, RouterLink } from '@angular/router';

import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';


import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';

import { InventoryApiService } from '../../services/inventory-api.service';

import { InventoryItem, InventoryWarehouse } from '../../models/inventory.models';

import { isStockableItemType } from '../../utils/inventory-display.util';



@Component({

  selector: 'app-stock-transfer',

  standalone: true,

  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent],

  templateUrl: './stock-transfer.component.html',

  styleUrl: './stock-transfer.component.scss'

})

export class StockTransferComponent implements OnInit {

  private readonly api = inject(InventoryApiService);

  private readonly router = inject(Router);

  private readonly fb = inject(FormBuilder);



  readonly saving = signal(false);

  readonly errorMessage = signal<string | null>(null);

  readonly warehouses = signal<InventoryWarehouse[]>([]);

  readonly items = signal<InventoryItem[]>([]);



  readonly form = this.fb.nonNullable.group({

    fromWarehouseId: [0, [Validators.required, Validators.min(1)]],

    toWarehouseId: [0, [Validators.required, Validators.min(1)]],

    notes: [''],

    lines: this.fb.array([this.createLineGroup()])

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

      next: (data) => this.items.set(data.filter((item) => isStockableItemType(item.itemType))),

      error: () => this.items.set([])

    });

  }



  createLineGroup(seed?: { itemId?: number; quantity?: number }) {

    return this.fb.nonNullable.group({

      itemId: [seed?.itemId ?? 0, [Validators.required, Validators.min(1)]],

      quantity: [seed?.quantity ?? 0, [Validators.required, Validators.min(0.0001)]]

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

    const value = this.form.getRawValue();

    if (value.fromWarehouseId === value.toWarehouseId) {

      this.errorMessage.set('Source and destination warehouses must differ.');

      return;

    }

    if (!confirm('Submit this stock transfer?')) {

      return;

    }



    this.saving.set(true);

    this.errorMessage.set(null);

    this.api

      .transferStock({

        fromWarehouseId: Number(value.fromWarehouseId),

        toWarehouseId: Number(value.toWarehouseId),

        notes: value.notes.trim() || null,

        lines: value.lines.map((line) => ({

          itemId: Number(line.itemId),

          quantity: Number(line.quantity)

        }))

      })

      .subscribe({

        next: () => {

          this.saving.set(false);

          void this.router.navigate(['/inventory/stock']);

        },

        error: (error) => {

          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to transfer stock.'));

          this.saving.set(false);

        }

      });

  }

}

