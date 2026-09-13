import { Routes } from '@angular/router';
import { featureGuard } from '../../core/guards/feature.guard';
import { permissionGuard } from '../../core/guards/permission.guard';
import { FeatureCodes, ModuleCodes } from '../../core/constants/feature-codes';
import { PermissionCodes } from '../../core/constants/permission-codes';

const inventoryItem = {
  moduleCode: ModuleCodes.Inventory,
  featureCode: FeatureCodes.InventoryItem
};

const inventoryStock = {
  moduleCode: ModuleCodes.Inventory,
  featureCode: FeatureCodes.InventoryStock
};

const inventoryPurchase = {
  moduleCode: ModuleCodes.Inventory,
  featureCode: FeatureCodes.InventoryPurchase
};

/**
 * Inventory routes — feature + permission gated.
 */
export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    canActivate: [featureGuard, permissionGuard],
    data: {
      moduleCode: ModuleCodes.Inventory,
      anyPermissions: [PermissionCodes.InventoryView]
    },
    loadComponent: () =>
      import('./pages/inventory-hub/inventory-hub.component').then((m) => m.InventoryHubComponent)
  },

  // Categories
  {
    path: 'categories',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryItem, permission: PermissionCodes.InventoryView },
    loadComponent: () =>
      import('./pages/categories/categories-list.component').then((m) => m.CategoryListComponent)
  },
  {
    path: 'categories/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryItem, permission: PermissionCodes.InventoryItemManage },
    loadComponent: () =>
      import('./pages/categories/categories-form.component').then((m) => m.CategoryFormComponent)
  },
  {
    path: 'categories/:id/edit',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryItem, permission: PermissionCodes.InventoryItemManage },
    loadComponent: () =>
      import('./pages/categories/categories-form.component').then((m) => m.CategoryFormComponent)
  },

  // Brands
  {
    path: 'brands',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryItem, permission: PermissionCodes.InventoryView },
    loadComponent: () =>
      import('./pages/brands/brands-list.component').then((m) => m.BrandListComponent)
  },
  {
    path: 'brands/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryItem, permission: PermissionCodes.InventoryItemManage },
    loadComponent: () =>
      import('./pages/brands/brands-form.component').then((m) => m.BrandFormComponent)
  },
  {
    path: 'brands/:id/edit',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryItem, permission: PermissionCodes.InventoryItemManage },
    loadComponent: () =>
      import('./pages/brands/brands-form.component').then((m) => m.BrandFormComponent)
  },

  // Items
  {
    path: 'items',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryItem, permission: PermissionCodes.InventoryView },
    loadComponent: () =>
      import('./pages/items/items-list.component').then((m) => m.ItemListComponent)
  },
  {
    path: 'items/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryItem, permission: PermissionCodes.InventoryItemManage },
    loadComponent: () =>
      import('./pages/items/items-form.component').then((m) => m.ItemFormComponent)
  },
  {
    path: 'items/:id/edit',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryItem, permission: PermissionCodes.InventoryItemManage },
    loadComponent: () =>
      import('./pages/items/items-form.component').then((m) => m.ItemFormComponent)
  },

  // Suppliers
  {
    path: 'suppliers',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryItem, permission: PermissionCodes.InventoryView },
    loadComponent: () =>
      import('./pages/suppliers/suppliers-list.component').then((m) => m.SupplierListComponent)
  },
  {
    path: 'suppliers/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryItem, permission: PermissionCodes.InventorySupplierManage },
    loadComponent: () =>
      import('./pages/suppliers/suppliers-form.component').then((m) => m.SupplierFormComponent)
  },
  {
    path: 'suppliers/:id/edit',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryItem, permission: PermissionCodes.InventorySupplierManage },
    loadComponent: () =>
      import('./pages/suppliers/suppliers-form.component').then((m) => m.SupplierFormComponent)
  },

  // Warehouses
  {
    path: 'warehouses',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryStock, permission: PermissionCodes.InventoryView },
    loadComponent: () =>
      import('./pages/warehouses/warehouses-list.component').then((m) => m.WarehouseListComponent)
  },
  {
    path: 'warehouses/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryStock, permission: PermissionCodes.InventoryWarehouseManage },
    loadComponent: () =>
      import('./pages/warehouses/warehouses-form.component').then((m) => m.WarehouseFormComponent)
  },
  {
    path: 'warehouses/:id/edit',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryStock, permission: PermissionCodes.InventoryWarehouseManage },
    loadComponent: () =>
      import('./pages/warehouses/warehouses-form.component').then((m) => m.WarehouseFormComponent)
  },

  // Stock
  {
    path: 'stock',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryStock, permission: PermissionCodes.InventoryView },
    loadComponent: () =>
      import('./pages/stock/stock-list.component').then((m) => m.StockListComponent)
  },
  {
    path: 'stock/adjust',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryStock, permission: PermissionCodes.InventoryStockAdjust },
    loadComponent: () =>
      import('./pages/stock/stock-adjust.component').then((m) => m.StockAdjustComponent)
  },
  {
    path: 'stock/transfer',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryStock, permission: PermissionCodes.InventoryStockTransfer },
    loadComponent: () =>
      import('./pages/stock/stock-transfer.component').then((m) => m.StockTransferComponent)
  },
  {
    path: 'stock-transactions',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryStock, permission: PermissionCodes.InventoryView },
    loadComponent: () =>
      import('./pages/stock-transactions/stock-transactions-list.component').then(
        (m) => m.StockTransactionsListComponent
      )
  },

  // Purchase orders
  {
    path: 'purchase-orders',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryPurchase, permission: PermissionCodes.InventoryView },
    loadComponent: () =>
      import('./pages/purchase-orders/purchase-orders-list.component').then(
        (m) => m.PurchaseOrderListComponent
      )
  },
  {
    path: 'purchase-orders/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryPurchase, permission: PermissionCodes.InventoryPurchaseManage },
    loadComponent: () =>
      import('./pages/purchase-orders/purchase-orders-form.component').then(
        (m) => m.PurchaseOrderFormComponent
      )
  },
  {
    path: 'purchase-orders/:id/edit',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryPurchase, permission: PermissionCodes.InventoryPurchaseManage },
    loadComponent: () =>
      import('./pages/purchase-orders/purchase-orders-form.component').then(
        (m) => m.PurchaseOrderFormComponent
      )
  },
  {
    path: 'purchase-orders/:id',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryPurchase, permission: PermissionCodes.InventoryView },
    loadComponent: () =>
      import('./pages/purchase-orders/purchase-orders-detail.component').then(
        (m) => m.PurchaseOrderDetailComponent
      )
  },

  // Goods receipt
  {
    path: 'goods-receipts/new',
    canActivate: [featureGuard, permissionGuard],
    data: { ...inventoryPurchase, permission: PermissionCodes.InventoryReceiptCreate },
    loadComponent: () =>
      import('./pages/goods-receipts/goods-receipt-create.component').then(
        (m) => m.GoodsReceiptCreateComponent
      )
  }
];
