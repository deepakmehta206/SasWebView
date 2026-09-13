import {
  formatMoney,
  formatQuantity,
  getPurchaseOrderActions,
  isStockableItemType,
  itemTypeLabel,
  purchaseOrderStatusLabel,
  remainingQuantity,
  stockTransactionTypeLabel,
  warehouseTypeLabel
} from './inventory-display.util';

describe('inventory-display.util', () => {
  it('labels item types', () => {
    expect(itemTypeLabel('GOODS')).toBe('Goods');
    expect(itemTypeLabel('SERVICE')).toBe('Service');
    expect(itemTypeLabel('CONSUMABLE')).toBe('Consumable');
  });

  it('labels warehouse types and PO statuses', () => {
    expect(warehouseTypeLabel('MAIN')).toBe('Main');
    expect(purchaseOrderStatusLabel('DRAFT')).toBe('Draft');
    expect(purchaseOrderStatusLabel('APPROVED')).toBe('Approved');
  });

  it('labels stock transaction types', () => {
    expect(stockTransactionTypeLabel('TRANSFER_IN')).toBe('Transfer in');
    expect(stockTransactionTypeLabel('PURCHASE_RECEIPT')).toBe('Purchase receipt');
  });

  it('computes remaining quantity for display only', () => {
    expect(remainingQuantity(10, 4)).toBe(6);
    expect(remainingQuantity(5, 5)).toBe(0);
  });

  it('formats quantity and money', () => {
    expect(formatQuantity(12.5)).toContain('12');
    expect(formatMoney(9.5)).toBe('9.50');
    expect(formatQuantity(null)).toBe('—');
  });

  it('identifies stockable item types', () => {
    expect(isStockableItemType('GOODS')).toBeTrue();
    expect(isStockableItemType('SERVICE')).toBeFalse();
  });

  it('returns PO action availability by status', () => {
    expect(getPurchaseOrderActions('DRAFT')).toEqual({
      canEdit: true,
      canApprove: true,
      canCancel: true,
      canClose: false,
      canReceive: false
    });
    expect(getPurchaseOrderActions('APPROVED')).toEqual({
      canEdit: false,
      canApprove: false,
      canCancel: true,
      canClose: true,
      canReceive: true
    });
    expect(getPurchaseOrderActions('CLOSED').canEdit).toBeFalse();
    expect(getPurchaseOrderActions('CANCELLED').canReceive).toBeFalse();
  });
});
