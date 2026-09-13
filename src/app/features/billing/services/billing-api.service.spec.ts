import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { BillingApiService } from './billing-api.service';

describe('BillingApiService', () => {
  let service: BillingApiService;
  let api: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'post', 'put', 'patch']);
    TestBed.configureTestingModule({
      providers: [BillingApiService, { provide: ApiService, useValue: api }]
    });
    service = TestBed.inject(BillingApiService);
  });

  it('GETs customers with empty params', () => {
    api.get.and.returnValue(of({ success: true, message: '', data: [], errors: [] }));
    service.getCustomers().subscribe();
    expect(api.get).toHaveBeenCalledWith('/billing/customers', { params: {} });
  });

  it('omits empty invoice filters and never adds tenantId', () => {
    const params = service.buildInvoiceParams({
      customerId: 5,
      status: '  ',
      branchId: null,
      fromDate: '',
      toDate: undefined
    });
    expect(params).toEqual({ customerId: 5 });
    expect(Object.prototype.hasOwnProperty.call(params, 'tenantId')).toBeFalse();
  });

  it('serializes payment params', () => {
    const params = service.buildPaymentParams({
      invoiceId: 9,
      fromDate: '2026-01-01',
      toDate: '2026-01-31'
    });
    expect(params).toEqual({
      invoiceId: 9,
      fromDate: '2026-01-01',
      toDate: '2026-01-31'
    });
  });

  it('POSTs approve and cancel invoice', () => {
    api.post.and.returnValue(of({ success: true, message: '', data: null, errors: [] }));
    service.approveInvoice(3).subscribe();
    expect(api.post).toHaveBeenCalledWith('/billing/invoices/3/approve', {});
    service.cancelInvoice(3).subscribe();
    expect(api.post).toHaveBeenCalledWith('/billing/invoices/3/cancel', {});
  });

  it('POSTs payment and cancels payment', () => {
    api.post.and.returnValue(of({ success: true, message: '', data: { paymentId: 1 }, errors: [] }));
    const body = {
      invoiceId: 2,
      paymentDate: '2026-01-01',
      amount: 10,
      paymentModeId: 1,
      referenceNumber: null,
      notes: null
    };
    service.postPayment(body).subscribe();
    expect(api.post).toHaveBeenCalledWith('/billing/payments', body);
    service.cancelPayment(8).subscribe();
    expect(api.post).toHaveBeenCalledWith('/billing/payments/8/cancel', {});
  });

  it('PATCHes customer status', () => {
    api.patch.and.returnValue(of({ success: true, message: '', data: null, errors: [] }));
    service.setCustomerStatus(4, { isActive: false }).subscribe();
    expect(api.patch).toHaveBeenCalledWith('/billing/customers/4/status', { isActive: false });
  });
});
