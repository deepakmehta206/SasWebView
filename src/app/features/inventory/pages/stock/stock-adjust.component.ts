import { Component, OnInit, inject, signal } from '@angular/core';

import { Router, RouterLink } from '@angular/router';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';


import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';

import { InventoryApiService } from '../../services/inventory-api.service';

import {

  InventoryItem,

  InventoryStockAdjustmentDirections,

  InventoryWarehouse

} from '../../models/inventory.models';

import { isStockableItemType } from '../../utils/inventory-display.util';



@Component({

  selector: 'app-stock-adjust',

  standalone: true,

  imports: [RouterLink, ReactiveFormsModule, PageHeaderComponent, UiCardComponent],

  templateUrl: './stock-adjust.component.html',

  styleUrl: './stock-adjust.component.scss'

})

export class StockAdjustComponent implements OnInit {

  private readonly api = inject(InventoryApiService);

  private readonly router = inject(Router);

  private readonly fb = inject(FormBuilder);



  readonly directions = InventoryStockAdjustmentDirections;

  readonly saving = signal(false);

  readonly errorMessage = signal<string | null>(null);

  readonly warehouses = signal<InventoryWarehouse[]>([]);

  readonly items = signal<InventoryItem[]>([]);



  readonly form = this.fb.nonNullable.group({

    warehouseId: [0, [Validators.required, Validators.min(1)]],

    itemId: [0, [Validators.required, Validators.min(1)]],

    direction: [InventoryStockAdjustmentDirections.In, Validators.required],

    quantity: [0, [Validators.required, Validators.min(0.0001)]],

    reason: ['', Validators.required]

  });



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



  submit(): void {

    if (this.form.invalid || this.saving()) {

      this.form.markAllAsTouched();

      return;

    }

    const value = this.form.getRawValue();

    const message = `Apply ${value.direction} adjustment of ${value.quantity}?`;

    if (!confirm(message)) {

      return;

    }



    this.saving.set(true);

    this.errorMessage.set(null);

    this.api

      .adjustStock({

        warehouseId: Number(value.warehouseId),

        itemId: Number(value.itemId),

        direction: value.direction,

        quantity: Number(value.quantity),

        reason: value.reason.trim()

      })

      .subscribe({

        next: () => {

          this.saving.set(false);

          void this.router.navigate(['/inventory/stock']);

        },

        error: (error) => {

          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to adjust stock.'));

          this.saving.set(false);

        }

      });

  }

}

