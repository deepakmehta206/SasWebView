import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuditApiService } from './audit-api.service';
import { AuditLog } from '../models/audit.models';

describe('AuditApiService', () => {
  let service: AuditApiService;
  let api: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<ApiService>('ApiService', ['get']);

    TestBed.configureTestingModule({
      providers: [AuditApiService, { provide: ApiService, useValue: api }]
    });

    service = TestBed.inject(AuditApiService);
  });

  it('GETs list endpoint', () => {
    api.get.and.returnValue(of({ success: true, message: '', data: [], errors: [] }));

    service.getAuditLogs().subscribe((rows) => {
      expect(rows).toEqual([]);
    });

    expect(api.get).toHaveBeenCalledWith('/audit-logs', { params: {} });
  });

  it('serializes list query params and omits empties', () => {
    api.get.and.returnValue(of({ success: true, message: '', data: [], errors: [] }));

    service
      .getAuditLogs({
        fromDate: '2026-01-01T00:00:00.000Z',
        toDate: '2026-01-31T23:59:59.999Z',
        userId: 10,
        action: 'LOGIN_SUCCESS',
        entityType: 'User',
        entityId: '10',
        category: 'SECURITY',
        skip: 50,
        take: 50
      })
      .subscribe();

    expect(api.get).toHaveBeenCalledWith('/audit-logs', {
      params: {
        fromDate: '2026-01-01T00:00:00.000Z',
        toDate: '2026-01-31T23:59:59.999Z',
        userId: 10,
        action: 'LOGIN_SUCCESS',
        entityType: 'User',
        entityId: '10',
        category: 'SECURITY',
        skip: 50,
        take: 50
      }
    });
  });

  it('omits empty filter strings and never adds tenantId', () => {
    const params = service.buildListParams({
      fromDate: '  ',
      toDate: '',
      action: undefined,
      category: '',
      entityType: null as unknown as string,
      skip: 0,
      take: 50
    });

    expect(params).toEqual({ skip: 0, take: 50 });
    expect(Object.prototype.hasOwnProperty.call(params, 'tenantId')).toBeFalse();
  });

  it('includes fromDate/toDate when provided as UTC bounds', () => {
    const params = service.buildListParams({
      fromDate: '2026-09-01T00:00:00.000Z',
      toDate: '2026-09-13T23:59:59.999Z'
    });

    expect(params['fromDate']).toBe('2026-09-01T00:00:00.000Z');
    expect(params['toDate']).toBe('2026-09-13T23:59:59.999Z');
  });

  it('GETs detail endpoint by id', () => {
    const detail: AuditLog = {
      auditLogId: 9,
      tenantId: 1001,
      userId: 10,
      branchId: null,
      category: 'FILE',
      action: 'FILE_UPLOADED',
      entityType: 'SaaSFile',
      entityId: '12',
      description: 'File uploaded.',
      ipAddress: '127.0.0.1',
      correlationId: 'abc',
      createdDate: '2026-01-01T00:00:00Z',
      oldValuesJson: null,
      newValuesJson: '{"fileId":12}',
      userAgent: 'Test'
    };
    api.get.and.returnValue(of({ success: true, message: '', data: detail, errors: [] }));

    service.getAuditLog(9).subscribe((row) => {
      expect(row.auditLogId).toBe(9);
    });

    expect(api.get).toHaveBeenCalledWith('/audit-logs/9');
  });
});
