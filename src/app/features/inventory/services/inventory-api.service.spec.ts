import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { InventoryApiService } from './inventory-api.service';

describe('InventoryApiService', () => {
  let service: InventoryApiService;
  let api: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'post', 'put', 'patch']);

    TestBed.configureTestingModule({
      providers: [InventoryApiService, { provide: ApiService, useValue: api }]
    });

    service = TestBed.inject(InventoryApiService);
  });

  it('GETs categories and omits empty filters', () => {
    api.get.and.returnValue(of({ success: true, message: '', data: [], errors: [] }));
    service.getCategories().subscribe();
    expect(api.get).toHaveBeenCalledWith('/inventory/categories', { params: {} });
  });

  it('serializes item list filters and never adds tenantId', () => {
    const params = service.buildItemParams({
      isActive: true,
      categoryId: 2,
      brandId: null,
      itemType: 'GOODS'
    });
    expect(params).toEqual({ isActive: true, categoryId: 2, itemType: 'GOODS' });
    expect(Object.prototype.hasOwnProperty.call(params, 'tenantId')).toBeFalse();
  });

  it('caps stock transaction take at 200 and includes skip/take', () => {
    const params = service.buildStockTransactionParams({
      skip: 50,
      take: 500,
      warehouseId: 1,
      transactionType: 'ADJUSTMENT_IN'
    });
    expect(params).toEqual({
      warehouseId: 1,
      transactionType: 'ADJUSTMENT_IN',
      skip: 50,
      take: 200
    });
  });

  it('GETs stock with lowStockOnly', () => {
    api.get.and.returnValue(of({ success: true, message: '', data: [], errors: [] }));
    service.getStock({ lowStockOnly: true, warehouseId: 9 }).subscribe();
    expect(api.get).toHaveBeenCalledWith('/inventory/stock', {
      params: { warehouseId: 9, lowStockOnly: true }
    });
  });

  it('PATCHes category status', () => {
    api.patch.and.returnValue(of({ success: true, message: '', data: null, errors: [] }));
    service.setCategoryStatus(5, false).subscribe();
    expect(api.patch).toHaveBeenCalledWith('/inventory/categories/5/status', { isActive: false });
  });

  it('POSTs stock adjustment', () => {
    api.post.and.returnValue(
      of({ success: true, message: '', data: { adjustmentId: 1 }, errors: [] })
    );
    service
      .adjustStock({
        warehouseId: 1,
        itemId: 2,
        direction: 'IN',
        quantity: 5,
        reason: 'Opening'
      })
      .subscribe();
    expect(api.post).toHaveBeenCalledWith('/inventory/stock-adjustments', {
      warehouseId: 1,
      itemId: 2,
      direction: 'IN',
      quantity: 5,
      reason: 'Opening'
    });
  });

  it('POSTs stock transfer', () => {
    api.post.and.returnValue(
      of({ success: true, message: '', data: { transferId: 3 }, errors: [] })
    );
    service
      .transferStock({
        fromWarehouseId: 1,
        toWarehouseId: 2,
        notes: null,
        lines: [{ itemId: 9, quantity: 1 }]
      })
      .subscribe();
    expect(api.post).toHaveBeenCalledWith('/inventory/transfers', {
      fromWarehouseId: 1,
      toWarehouseId: 2,
      notes: null,
      lines: [{ itemId: 9, quantity: 1 }]
    });
  });

  it('POSTs purchase order approve/cancel/close', () => {
    api.post.and.returnValue(of({ success: true, message: '', data: null, errors: [] }));
    service.approvePurchaseOrder(10).subscribe();
    expect(api.post).toHaveBeenCalledWith('/inventory/purchase-orders/10/approve', {});
    service.cancelPurchaseOrder(10).subscribe();
    expect(api.post).toHaveBeenCalledWith('/inventory/purchase-orders/10/cancel', {});
    service.closePurchaseOrder(10).subscribe();
    expect(api.post).toHaveBeenCalledWith('/inventory/purchase-orders/10/close', {});
  });

  it('POSTs goods receipt', () => {
    api.post.and.returnValue(
      of({ success: true, message: '', data: { goodsReceiptId: 7 }, errors: [] })
    );
    const body = {
      purchaseOrderId: 1,
      warehouseId: 2,
      receiptDate: '2026-01-01T00:00:00.000Z',
      notes: null,
      lines: [{ purchaseOrderDetailId: 3, quantityReceived: 1, unitCost: 10 }]
    };
    service.createGoodsReceipt(body).subscribe();
    expect(api.post).toHaveBeenCalledWith('/inventory/goods-receipts', body);
  });

  it('PUTs item and GETs purchase order by id', () => {
    api.put.and.returnValue(of({ success: true, message: '', data: {}, errors: [] }));
    api.get.and.returnValue(of({ success: true, message: '', data: { purchaseOrderId: 4 }, errors: [] }));
    service
      .updateItem(8, {
        itemCode: 'A',
        itemName: 'B',
        description: null,
        categoryId: null,
        brandId: null,
        unitOfMeasureId: 1,
        itemType: 'GOODS',
        barcode: null,
        sku: null,
        reorderLevel: 0,
        reorderQuantity: 0,
        costPrice: 0,
        sellingPrice: 0,
        isActive: true
      })
      .subscribe();
    expect(api.put).toHaveBeenCalled();
    expect((api.put.calls.mostRecent().args[0] as string)).toBe('/inventory/items/8');

    service.getPurchaseOrder(4).subscribe();
    expect(api.get).toHaveBeenCalledWith('/inventory/purchase-orders/4');
  });
});
