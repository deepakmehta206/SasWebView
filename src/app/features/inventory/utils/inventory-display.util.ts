import {
  InventoryItemTypes,
  InventoryPurchaseOrderStatuses,
  InventoryStockTransactionTypes,
  InventoryWarehouseTypes
} from '../models/inventory.models';

export function itemTypeLabel(value: string): string {
  switch (value) {
    case InventoryItemTypes.Goods:
      return 'Goods';
    case InventoryItemTypes.Service:
      return 'Service';
    case InventoryItemTypes.Consumable:
      return 'Consumable';
    default:
      return value || '—';
  }
}

export function warehouseTypeLabel(value: string): string {
  switch (value) {
    case InventoryWarehouseTypes.Main:
      return 'Main';
    case InventoryWarehouseTypes.Store:
      return 'Store';
    case InventoryWarehouseTypes.Transit:
      return 'Transit';
    default:
      return value || '—';
  }
}

export function purchaseOrderStatusLabel(value: string): string {
  switch (value) {
    case InventoryPurchaseOrderStatuses.Draft:
      return 'Draft';
    case InventoryPurchaseOrderStatuses.Approved:
      return 'Approved';
    case InventoryPurchaseOrderStatuses.Cancelled:
      return 'Cancelled';
    case InventoryPurchaseOrderStatuses.Closed:
      return 'Closed';
    default:
      return value || '—';
  }
}

export function purchaseOrderStatusModifier(value: string): string {
  switch (value) {
    case InventoryPurchaseOrderStatuses.Draft:
      return 'status-pill--muted';
    case InventoryPurchaseOrderStatuses.Approved:
      return 'status-pill--accent';
    case InventoryPurchaseOrderStatuses.Cancelled:
      return 'status-pill--danger';
    case InventoryPurchaseOrderStatuses.Closed:
      return 'status-pill--success';
    default:
      return '';
  }
}

export function stockTransactionTypeLabel(value: string): string {
  switch (value) {
    case InventoryStockTransactionTypes.Opening:
      return 'Opening';
    case InventoryStockTransactionTypes.PurchaseReceipt:
      return 'Purchase receipt';
    case InventoryStockTransactionTypes.AdjustmentIn:
      return 'Adjustment in';
    case InventoryStockTransactionTypes.AdjustmentOut:
      return 'Adjustment out';
    case InventoryStockTransactionTypes.TransferOut:
      return 'Transfer out';
    case InventoryStockTransactionTypes.TransferIn:
      return 'Transfer in';
    default:
      return value || '—';
  }
}

/** Display-only. Backend remains authoritative. */
export function remainingQuantity(ordered: number, received: number): number {
  const remaining = Number(ordered) - Number(received);
  return Number.isFinite(remaining) ? remaining : 0;
}

export function formatQuantity(value: number | null | undefined, fractionDigits = 4): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—';
  }
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits
  });
}

export function formatMoney(value: number | null | undefined, fractionDigits = 2): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—';
  }
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  });
}

export function isStockableItemType(itemType: string): boolean {
  return itemType !== InventoryItemTypes.Service;
}

export interface PurchaseOrderActionAvailability {
  canEdit: boolean;
  canApprove: boolean;
  canCancel: boolean;
  canClose: boolean;
  canReceive: boolean;
}

/**
 * UI-only action availability from PO status.
 * Permissions are checked separately by callers.
 */
export function getPurchaseOrderActions(status: string): PurchaseOrderActionAvailability {
  const normalized = (status || '').toUpperCase();
  return {
    canEdit: normalized === InventoryPurchaseOrderStatuses.Draft,
    canApprove: normalized === InventoryPurchaseOrderStatuses.Draft,
    canCancel:
      normalized === InventoryPurchaseOrderStatuses.Draft ||
      normalized === InventoryPurchaseOrderStatuses.Approved,
    canClose: normalized === InventoryPurchaseOrderStatuses.Approved,
    canReceive: normalized === InventoryPurchaseOrderStatuses.Approved
  };
}
