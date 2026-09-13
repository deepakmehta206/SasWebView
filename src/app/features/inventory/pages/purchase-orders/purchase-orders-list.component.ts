import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
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

  InventoryPurchaseOrderStatuses,

  InventorySupplier,

  PurchaseOrder

} from '../../models/inventory.models';

import { purchaseOrderStatusLabel, purchaseOrderStatusModifier } from '../../utils/inventory-display.util';



@Component({

  selector: 'app-purchase-orders-list',

  standalone: true,

  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,

    PageHeaderComponent,

    UiCardComponent,

    LoadingIndicatorComponent,

    EmptyStateComponent,

    HasPermissionDirective

  ],

  templateUrl: './purchase-orders-list.component.html',

  styleUrl: './purchase-orders-list.component.scss'

})

export class PurchaseOrderListComponent implements OnInit {

  private readonly api = inject(InventoryApiService);

  private readonly fb = inject(FormBuilder);



  readonly permissionCodes = PermissionCodes;

  readonly statuses = InventoryPurchaseOrderStatuses;

  readonly purchaseOrderStatusLabel = purchaseOrderStatusLabel;

  readonly purchaseOrderStatusModifier = purchaseOrderStatusModifier;

  readonly loading = signal(true);

  readonly rows = signal<PurchaseOrder[]>([]);

  readonly suppliers = signal<InventorySupplier[]>([]);

  readonly errorMessage = signal<string | null>(null);



  readonly filters = this.fb.nonNullable.group({

    supplierId: [null as number | null],

    status: [''],

    fromDate: [''],

    toDate: ['']

  });



  ngOnInit(): void {

    this.api.getSuppliers({ isActive: true }).subscribe({

      next: (data) => this.suppliers.set(data),

      error: () => this.suppliers.set([])

    });

    this.load();

  }



  load(): void {

    this.loading.set(true);

    this.errorMessage.set(null);

    const value = this.filters.getRawValue();

    this.api

      .getPurchaseOrders({

        supplierId: value.supplierId,

        status: value.status || null,

        fromDate: value.fromDate || null,

        toDate: value.toDate || null

      })

      .subscribe({

        next: (data) => {

          this.rows.set(data);

          this.loading.set(false);

        },

        error: (error) => {

          this.rows.set([]);

          this.errorMessage.set(extractApiErrorMessage(error, 'Unable to load purchase orders.'));

          this.loading.set(false);

        }

      });

  }



  supplierName(supplierId: number): string {

    const supplier = this.suppliers().find((row) => row.supplierId === supplierId);

    return supplier ? supplier.supplierName : String(supplierId);

  }

}

