import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';

import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';

import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

import { extractApiErrorMessage } from '../../../../core/utils/api-error.util';

import { InventoryApiService } from '../../services/inventory-api.service';

import {

  InventoryItem,

  InventoryStockTransactionTypes,

  InventoryWarehouse,

  STOCK_TXN_PAGE_SIZE,

  StockTransaction

} from '../../models/inventory.models';

import { formatQuantity, stockTransactionTypeLabel } from '../../utils/inventory-display.util';



@Component({

  selector: 'app-stock-transactions-list',

  standalone: true,

  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,

    PageHeaderComponent,

    UiCardComponent,

    LoadingIndicatorComponent,

    EmptyStateComponent

  ],

  templateUrl: './stock-transactions-list.component.html',

  styleUrl: './stock-transactions-list.component.scss'

})

export class StockTransactionsListComponent implements OnInit {

  private readonly api = inject(InventoryApiService);

  private readonly fb = inject(FormBuilder);



  readonly transactionTypes = InventoryStockTransactionTypes;

  readonly stockTransactionTypeLabel = stockTransactionTypeLabel;

  readonly formatQuantity = formatQuantity;

  readonly pageSize = STOCK_TXN_PAGE_SIZE;

  readonly loading = signal(true);

  readonly rows = signal<StockTransaction[]>([]);

  readonly warehouses = signal<InventoryWarehouse[]>([]);

  readonly items = signal<InventoryItem[]>([]);

  readonly errorMessage = signal<string | null>(null);

  readonly skip = signal(0);



  readonly filters = this.fb.nonNullable.group({

    warehouseId: [null as number | null],

    itemId: [null as number | null],

    transactionType: [''],

    fromDate: [''],

    toDate: ['']

  });



  ngOnInit(): void {

    this.api.getWarehouses({ isActive: true }).subscribe({

      next: (data) => this.warehouses.set(data),

      error: () => this.warehouses.set([])

    });

    this.api.getItems({ isActive: true }).subscribe({

      next: (data) => this.items.set(data),

      error: () => this.items.set([])

    });

    this.load(true);

  }



  load(reset = false): void {

    if (reset) {

      this.skip.set(0);

    }

    this.loading.set(true);

    this.errorMessage.set(null);

    const value = this.filters.getRawValue();

    this.api

      .getStockTransactions({

        warehouseId: value.warehouseId,

        itemId: value.itemId,

        transactionType: value.transactionType || null,

        fromDate: value.fromDate || null,

        toDate: value.toDate || null,

        skip: this.skip(),

        take: this.pageSize

      })

      .subscribe({

        next: (data) => {

          this.rows.set(data);

          this.loading.set(false);

        },

        error: (error) => {

          this.rows.set([]);

          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load transactions.'));

          this.loading.set(false);

        }

      });

  }



  nextPage(): void {

    if (this.rows().length < this.pageSize) {

      return;

    }

    this.skip.update((value) => value + this.pageSize);

    this.load();

  }



  prevPage(): void {

    if (this.skip() <= 0) {

      return;

    }

    this.skip.update((value) => Math.max(0, value - this.pageSize));

    this.load();

  }

}

