import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AdminAuditApiService } from './admin-audit-api.service';

describe('AdminAuditApiService', () => {
  let service: AdminAuditApiService;
  let api: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<ApiService>('ApiService', ['get']);
    TestBed.configureTestingModule({
      providers: [AdminAuditApiService, { provide: ApiService, useValue: api }]
    });
    service = TestBed.inject(AdminAuditApiService);
  });

  it('GETs platform audit URL', () => {
    api.get.and.returnValue(of({ success: true, message: '', data: [], errors: [] }));
    service.getPlatformAuditLogs().subscribe();
    expect(api.get).toHaveBeenCalledWith('/admin/audit-logs', { params: {} });
  });

  it('serializes supported query params only and never adds tenantId', () => {
    const params = service.buildListParams({
      fromDate: '2026-01-01T00:00:00.000Z',
      toDate: '2026-01-31T23:59:59.999Z',
      userId: 10,
      action: 'TENANT_PROVISIONED',
      entityType: 'Tenant',
      entityId: '9',
      category: 'PLATFORM',
      skip: 0,
      take: 50
    });

    expect(params).toEqual({
      fromDate: '2026-01-01T00:00:00.000Z',
      toDate: '2026-01-31T23:59:59.999Z',
      userId: 10,
      action: 'TENANT_PROVISIONED',
      entityType: 'Tenant',
      entityId: '9',
      category: 'PLATFORM',
      skip: 0,
      take: 50
    });
    expect(Object.prototype.hasOwnProperty.call(params, 'tenantId')).toBeFalse();
    expect(Object.prototype.hasOwnProperty.call(params, 'targetTenantId')).toBeFalse();
  });

  it('omits empty filter strings', () => {
    const params = service.buildListParams({
      fromDate: '  ',
      action: '',
      category: undefined,
      skip: 50,
      take: 50
    });
    expect(params).toEqual({ skip: 50, take: 50 });
  });
});
