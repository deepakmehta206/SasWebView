import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UiCardComponent } from '../../../../shared/components/ui-card/ui-card.component';
import { HasPermissionDirective } from '../../../../core/permissions/has-permission.directive';
import { PermissionCodes } from '../../../../core/constants/permission-codes';

@Component({
  selector: 'app-inventory-hub',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, UiCardComponent, HasPermissionDirective],
  templateUrl: './inventory-hub.component.html',
  styleUrl: './inventory-hub.component.scss'
})
export class InventoryHubComponent {
  readonly permissionCodes = PermissionCodes;

  readonly mainLinks = [
    {
      title: 'Items',
      description: 'Categories, brands, items, and suppliers.',
      route: '/inventory/items'
    },
    {
      title: 'Stock',
      description: 'Warehouses, on-hand stock, adjustments, and transfers.',
      route: '/inventory/stock'
    },
    {
      title: 'Purchases',
      description: 'Purchase orders and goods receipts.',
      route: '/inventory/purchase-orders'
    }
  ] as const;

  readonly secondaryLinks = [
    { title: 'Categories', route: '/inventory/categories', permission: PermissionCodes.InventoryView },
    { title: 'Brands', route: '/inventory/brands', permission: PermissionCodes.InventoryView },
    { title: 'Suppliers', route: '/inventory/suppliers', permission: PermissionCodes.InventoryView },
    { title: 'Warehouses', route: '/inventory/warehouses', permission: PermissionCodes.InventoryView },
    {
      title: 'Stock adjustments',
      route: '/inventory/stock/adjust',
      permission: PermissionCodes.InventoryStockAdjust
    },
    {
      title: 'Stock transfers',
      route: '/inventory/stock/transfer',
      permission: PermissionCodes.InventoryStockTransfer
    },
    {
      title: 'Stock transactions',
      route: '/inventory/stock-transactions',
      permission: PermissionCodes.InventoryView
    },
    {
      title: 'Goods receipt',
      route: '/inventory/goods-receipts/new',
      permission: PermissionCodes.InventoryReceiptCreate
    }
  ] as const;
}
