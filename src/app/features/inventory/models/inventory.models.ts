/** Phase 10 Inventory models — mirror backend InventoryDtos exactly. */

export const InventoryItemTypes = {
  Goods: 'GOODS',
  Service: 'SERVICE',
  Consumable: 'CONSUMABLE'
} as const;

export const InventoryWarehouseTypes = {
  Main: 'MAIN',
  Store: 'STORE',
  Transit: 'TRANSIT'
} as const;

export const InventoryPurchaseOrderStatuses = {
  Draft: 'DRAFT',
  Approved: 'APPROVED',
  Cancelled: 'CANCELLED',
  Closed: 'CLOSED'
} as const;

export const InventoryStockTransactionTypes = {
  Opening: 'OPENING',
  PurchaseReceipt: 'PURCHASE_RECEIPT',
  AdjustmentIn: 'ADJUSTMENT_IN',
  AdjustmentOut: 'ADJUSTMENT_OUT',
  TransferOut: 'TRANSFER_OUT',
  TransferIn: 'TRANSFER_IN'
} as const;

export const InventoryStockAdjustmentDirections = {
  In: 'IN',
  Out: 'OUT'
} as const;

export interface ItemCategory {
  categoryId: number;
  tenantId: number;
  categoryCode: string;
  categoryName: string;
  parentCategoryId: number | null;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string | null;
}

export interface CreateItemCategoryRequest {
  categoryCode: string;
  categoryName: string;
  parentCategoryId: number | null;
}

export interface UpdateItemCategoryRequest {
  categoryCode: string;
  categoryName: string;
  parentCategoryId: number | null;
  isActive: boolean;
}

export interface ItemBrand {
  brandId: number;
  tenantId: number;
  brandCode: string;
  brandName: string;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string | null;
}

export interface CreateItemBrandRequest {
  brandCode: string;
  brandName: string;
}

export interface UpdateItemBrandRequest {
  brandCode: string;
  brandName: string;
  isActive: boolean;
}

export interface InventoryItem {
  itemId: number;
  tenantId: number;
  itemCode: string;
  itemName: string;
  description: string | null;
  categoryId: number | null;
  brandId: number | null;
  unitOfMeasureId: number;
  itemType: string;
  barcode: string | null;
  sku: string | null;
  reorderLevel: number;
  reorderQuantity: number;
  costPrice: number;
  sellingPrice: number;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string | null;
}

export interface CreateItemRequest {
  itemCode: string;
  itemName: string;
  description: string | null;
  categoryId: number | null;
  brandId: number | null;
  unitOfMeasureId: number;
  itemType: string;
  barcode: string | null;
  sku: string | null;
  reorderLevel: number;
  reorderQuantity: number;
  costPrice: number;
  sellingPrice: number;
}

export interface UpdateItemRequest extends CreateItemRequest {
  isActive: boolean;
}

export interface InventorySupplier {
  supplierId: number;
  tenantId: number;
  supplierCode: string;
  supplierName: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  taxNumber: string | null;
  paymentTerms: string | null;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string | null;
}

export interface CreateSupplierRequest {
  supplierCode: string;
  supplierName: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  taxNumber: string | null;
  paymentTerms: string | null;
}

export interface UpdateSupplierRequest extends CreateSupplierRequest {
  isActive: boolean;
}

export interface InventoryWarehouse {
  warehouseId: number;
  tenantId: number;
  branchId: number;
  warehouseCode: string;
  warehouseName: string;
  warehouseType: string;
  address: string | null;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string | null;
}

export interface CreateWarehouseRequest {
  branchId: number;
  warehouseCode: string;
  warehouseName: string;
  warehouseType: string;
  address: string | null;
}

export interface UpdateWarehouseRequest extends CreateWarehouseRequest {
  isActive: boolean;
}

export interface WarehouseStock {
  warehouseStockId: number;
  tenantId: number;
  warehouseId: number;
  itemId: number;
  quantityOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
  averageCost: number;
  lastUpdatedDate: string;
  itemCode: string;
  itemName: string;
  itemType: string;
  reorderLevel: number;
  itemIsActive: boolean;
  warehouseCode: string;
  warehouseName: string;
  branchId: number;
}

export interface StockTransaction {
  transactionId: number;
  tenantId: number;
  warehouseId: number;
  itemId: number;
  transactionType: string;
  quantity: number;
  unitCost: number | null;
  referenceType: string | null;
  referenceId: number | null;
  notes: string | null;
  createdDate: string;
  createdBy: number | null;
}

export interface StockAdjustmentRequest {
  warehouseId: number;
  itemId: number;
  direction: string;
  quantity: number;
  reason: string;
}

export interface StockAdjustmentResponse {
  adjustmentId: number;
}

export interface StockTransferLine {
  itemId: number;
  quantity: number;
}

export interface StockTransferRequest {
  fromWarehouseId: number;
  toWarehouseId: number;
  notes: string | null;
  lines: StockTransferLine[];
}

export interface StockTransferResponse {
  transferId: number;
}

export interface PurchaseOrderLineRequest {
  itemId: number;
  quantityOrdered: number;
  unitCost: number;
  notes: string | null;
}

export interface PurchaseOrderDetail {
  purchaseOrderDetailId: number;
  purchaseOrderId: number;
  tenantId: number;
  itemId: number;
  quantityOrdered: number;
  unitCost: number;
  receivedQuantity: number;
  notes: string | null;
}

export interface PurchaseOrder {
  purchaseOrderId: number;
  tenantId: number;
  supplierId: number;
  warehouseId: number | null;
  orderNumber: string;
  orderDate: string;
  status: string;
  notes: string | null;
  createdDate: string;
  modifiedDate: string | null;
  details: PurchaseOrderDetail[];
}

export interface CreatePurchaseOrderRequest {
  supplierId: number;
  warehouseId: number | null;
  orderNumber: string | null;
  orderDate: string;
  notes: string | null;
  lines: PurchaseOrderLineRequest[];
}

export interface UpdatePurchaseOrderRequest {
  supplierId: number;
  warehouseId: number | null;
  orderDate: string;
  notes: string | null;
  lines: PurchaseOrderLineRequest[];
}

export interface GoodsReceiptLine {
  purchaseOrderDetailId: number;
  quantityReceived: number;
  unitCost: number;
}

export interface GoodsReceiptRequest {
  purchaseOrderId: number;
  warehouseId: number;
  receiptDate: string;
  notes: string | null;
  lines: GoodsReceiptLine[];
}

export interface GoodsReceiptResponse {
  goodsReceiptId: number;
}

export interface CategoryListQuery {
  isActive?: boolean | null;
}

export interface BrandListQuery {
  isActive?: boolean | null;
}

export interface ItemListQuery {
  isActive?: boolean | null;
  categoryId?: number | null;
  brandId?: number | null;
  itemType?: string | null;
}

export interface SupplierListQuery {
  isActive?: boolean | null;
}

export interface WarehouseListQuery {
  branchId?: number | null;
  isActive?: boolean | null;
}

export interface StockListQuery {
  warehouseId?: number | null;
  itemId?: number | null;
  isActive?: boolean | null;
  lowStockOnly?: boolean | null;
}

export interface StockTransactionQuery {
  warehouseId?: number | null;
  itemId?: number | null;
  transactionType?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  referenceType?: string | null;
  referenceId?: number | null;
  skip?: number | null;
  take?: number | null;
}

export interface PurchaseOrderListQuery {
  supplierId?: number | null;
  status?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
}

export const STOCK_TXN_PAGE_SIZE = 50;
export const STOCK_TXN_MAX_TAKE = 200;
