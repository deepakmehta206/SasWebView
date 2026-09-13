import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  BrandListQuery,
  CategoryListQuery,
  CreateItemBrandRequest,
  CreateItemCategoryRequest,
  CreateItemRequest,
  CreatePurchaseOrderRequest,
  CreateSupplierRequest,
  CreateWarehouseRequest,
  GoodsReceiptRequest,
  GoodsReceiptResponse,
  InventoryItem,
  InventorySupplier,
  InventoryWarehouse,
  ItemBrand,
  ItemCategory,
  ItemListQuery,
  PurchaseOrder,
  PurchaseOrderListQuery,
  STOCK_TXN_MAX_TAKE,
  StockAdjustmentRequest,
  StockAdjustmentResponse,
  StockListQuery,
  StockTransaction,
  StockTransactionQuery,
  StockTransferRequest,
  StockTransferResponse,
  SupplierListQuery,
  UpdateItemBrandRequest,
  UpdateItemCategoryRequest,
  UpdateItemRequest,
  UpdatePurchaseOrderRequest,
  UpdateSupplierRequest,
  UpdateWarehouseRequest,
  WarehouseListQuery,
  WarehouseStock
} from '../models/inventory.models';

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private readonly api = inject(ApiService);

  // ——— Categories ———
  getCategories(query?: CategoryListQuery): Observable<ItemCategory[]> {
    return this.list('/inventory/categories', this.buildSimpleActiveParams(query));
  }

  getCategory(id: number): Observable<ItemCategory> {
    return this.one<ItemCategory>(`/inventory/categories/${id}`);
  }

  createCategory(body: CreateItemCategoryRequest): Observable<ItemCategory> {
    return this.create('/inventory/categories', body);
  }

  updateCategory(id: number, body: UpdateItemCategoryRequest): Observable<ItemCategory> {
    return this.update(`/inventory/categories/${id}`, body);
  }

  setCategoryStatus(id: number, isActive: boolean): Observable<unknown> {
    return this.setStatus(`/inventory/categories/${id}/status`, isActive);
  }

  // ——— Brands ———
  getBrands(query?: BrandListQuery): Observable<ItemBrand[]> {
    return this.list('/inventory/brands', this.buildSimpleActiveParams(query));
  }

  getBrand(id: number): Observable<ItemBrand> {
    return this.one<ItemBrand>(`/inventory/brands/${id}`);
  }

  createBrand(body: CreateItemBrandRequest): Observable<ItemBrand> {
    return this.create('/inventory/brands', body);
  }

  updateBrand(id: number, body: UpdateItemBrandRequest): Observable<ItemBrand> {
    return this.update(`/inventory/brands/${id}`, body);
  }

  setBrandStatus(id: number, isActive: boolean): Observable<unknown> {
    return this.setStatus(`/inventory/brands/${id}/status`, isActive);
  }

  // ——— Items ———
  getItems(query?: ItemListQuery): Observable<InventoryItem[]> {
    return this.list('/inventory/items', this.buildItemParams(query));
  }

  getItem(id: number): Observable<InventoryItem> {
    return this.one<InventoryItem>(`/inventory/items/${id}`);
  }

  createItem(body: CreateItemRequest): Observable<InventoryItem> {
    return this.create('/inventory/items', body);
  }

  updateItem(id: number, body: UpdateItemRequest): Observable<InventoryItem> {
    return this.update(`/inventory/items/${id}`, body);
  }

  setItemStatus(id: number, isActive: boolean): Observable<unknown> {
    return this.setStatus(`/inventory/items/${id}/status`, isActive);
  }

  // ——— Suppliers ———
  getSuppliers(query?: SupplierListQuery): Observable<InventorySupplier[]> {
    return this.list('/inventory/suppliers', this.buildSimpleActiveParams(query));
  }

  getSupplier(id: number): Observable<InventorySupplier> {
    return this.one<InventorySupplier>(`/inventory/suppliers/${id}`);
  }

  createSupplier(body: CreateSupplierRequest): Observable<InventorySupplier> {
    return this.create('/inventory/suppliers', body);
  }

  updateSupplier(id: number, body: UpdateSupplierRequest): Observable<InventorySupplier> {
    return this.update(`/inventory/suppliers/${id}`, body);
  }

  setSupplierStatus(id: number, isActive: boolean): Observable<unknown> {
    return this.setStatus(`/inventory/suppliers/${id}/status`, isActive);
  }

  // ——— Warehouses ———
  getWarehouses(query?: WarehouseListQuery): Observable<InventoryWarehouse[]> {
    return this.list('/inventory/warehouses', this.buildWarehouseParams(query));
  }

  getWarehouse(id: number): Observable<InventoryWarehouse> {
    return this.one<InventoryWarehouse>(`/inventory/warehouses/${id}`);
  }

  createWarehouse(body: CreateWarehouseRequest): Observable<InventoryWarehouse> {
    return this.create('/inventory/warehouses', body);
  }

  updateWarehouse(id: number, body: UpdateWarehouseRequest): Observable<InventoryWarehouse> {
    return this.update(`/inventory/warehouses/${id}`, body);
  }

  setWarehouseStatus(id: number, isActive: boolean): Observable<unknown> {
    return this.setStatus(`/inventory/warehouses/${id}/status`, isActive);
  }

  // ——— Stock ———
  getStock(query?: StockListQuery): Observable<WarehouseStock[]> {
    return this.list('/inventory/stock', this.buildStockParams(query));
  }

  getStockTransactions(query?: StockTransactionQuery): Observable<StockTransaction[]> {
    return this.list('/inventory/stock-transactions', this.buildStockTransactionParams(query));
  }

  adjustStock(body: StockAdjustmentRequest): Observable<StockAdjustmentResponse> {
    return this.create('/inventory/stock-adjustments', body);
  }

  transferStock(body: StockTransferRequest): Observable<StockTransferResponse> {
    return this.create('/inventory/transfers', body);
  }

  // ——— Purchase orders ———
  getPurchaseOrders(query?: PurchaseOrderListQuery): Observable<PurchaseOrder[]> {
    return this.list('/inventory/purchase-orders', this.buildPurchaseOrderParams(query));
  }

  getPurchaseOrder(id: number): Observable<PurchaseOrder> {
    return this.one<PurchaseOrder>(`/inventory/purchase-orders/${id}`);
  }

  createPurchaseOrder(body: CreatePurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.create('/inventory/purchase-orders', body);
  }

  updatePurchaseOrder(id: number, body: UpdatePurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.update(`/inventory/purchase-orders/${id}`, body);
  }

  approvePurchaseOrder(id: number): Observable<unknown> {
    return this.api
      .post<ApiResponse<unknown>>(`/inventory/purchase-orders/${id}/approve`, {})
      .pipe(map((response) => response.data));
  }

  cancelPurchaseOrder(id: number): Observable<unknown> {
    return this.api
      .post<ApiResponse<unknown>>(`/inventory/purchase-orders/${id}/cancel`, {})
      .pipe(map((response) => response.data));
  }

  closePurchaseOrder(id: number): Observable<unknown> {
    return this.api
      .post<ApiResponse<unknown>>(`/inventory/purchase-orders/${id}/close`, {})
      .pipe(map((response) => response.data));
  }

  createGoodsReceipt(body: GoodsReceiptRequest): Observable<GoodsReceiptResponse> {
    return this.create('/inventory/goods-receipts', body);
  }

  // ——— Param builders (public for tests) ———

  /** Never includes tenantId. Omits null/undefined/empty string. */
  buildSimpleActiveParams(query?: { isActive?: boolean | null }): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {};
    if (!query) {
      return params;
    }
    if (query.isActive !== undefined && query.isActive !== null) {
      params['isActive'] = query.isActive;
    }
    return params;
  }

  buildItemParams(query?: ItemListQuery): Record<string, string | number | boolean> {
    const params = this.buildSimpleActiveParams(query);
    if (!query) {
      return params;
    }
    this.setNumber(params, 'categoryId', query.categoryId);
    this.setNumber(params, 'brandId', query.brandId);
    this.setString(params, 'itemType', query.itemType);
    return params;
  }

  buildWarehouseParams(query?: WarehouseListQuery): Record<string, string | number | boolean> {
    const params = this.buildSimpleActiveParams(query);
    if (!query) {
      return params;
    }
    this.setNumber(params, 'branchId', query.branchId);
    return params;
  }

  buildStockParams(query?: StockListQuery): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {};
    if (!query) {
      return params;
    }
    this.setNumber(params, 'warehouseId', query.warehouseId);
    this.setNumber(params, 'itemId', query.itemId);
    if (query.isActive !== undefined && query.isActive !== null) {
      params['isActive'] = query.isActive;
    }
    if (query.lowStockOnly !== undefined && query.lowStockOnly !== null) {
      params['lowStockOnly'] = query.lowStockOnly;
    }
    return params;
  }

  buildStockTransactionParams(query?: StockTransactionQuery): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {};
    if (!query) {
      return params;
    }
    this.setNumber(params, 'warehouseId', query.warehouseId);
    this.setNumber(params, 'itemId', query.itemId);
    this.setString(params, 'transactionType', query.transactionType);
    this.setString(params, 'fromDate', query.fromDate);
    this.setString(params, 'toDate', query.toDate);
    this.setString(params, 'referenceType', query.referenceType);
    this.setNumber(params, 'referenceId', query.referenceId);
    if (query.skip !== undefined && query.skip !== null) {
      params['skip'] = query.skip;
    }
    if (query.take !== undefined && query.take !== null) {
      params['take'] = Math.min(query.take, STOCK_TXN_MAX_TAKE);
    }
    return params;
  }

  buildPurchaseOrderParams(query?: PurchaseOrderListQuery): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {};
    if (!query) {
      return params;
    }
    this.setNumber(params, 'supplierId', query.supplierId);
    this.setString(params, 'status', query.status);
    this.setString(params, 'fromDate', query.fromDate);
    this.setString(params, 'toDate', query.toDate);
    return params;
  }

  private list<T>(path: string, params: Record<string, string | number | boolean>): Observable<T[]> {
    return this.api
      .get<ApiResponse<T[]>>(path, { params })
      .pipe(map((response) => response.data ?? []));
  }

  private one<T>(path: string): Observable<T> {
    return this.api.get<ApiResponse<T>>(path).pipe(map((response) => response.data as T));
  }

  private create<T>(path: string, body: unknown): Observable<T> {
    return this.api.post<ApiResponse<T>>(path, body).pipe(map((response) => response.data as T));
  }

  private update<T>(path: string, body: unknown): Observable<T> {
    return this.api.put<ApiResponse<T>>(path, body).pipe(map((response) => response.data as T));
  }

  private setStatus(path: string, isActive: boolean): Observable<unknown> {
    return this.api
      .patch<ApiResponse<unknown>>(path, { isActive })
      .pipe(map((response) => response.data));
  }

  private setNumber(
    params: Record<string, string | number | boolean>,
    key: string,
    value: number | null | undefined
  ): void {
    if (value !== undefined && value !== null && !Number.isNaN(value)) {
      params[key] = value;
    }
  }

  private setString(
    params: Record<string, string | number | boolean>,
    key: string,
    value: string | null | undefined
  ): void {
    if (value?.trim()) {
      params[key] = value.trim();
    }
  }
}
