import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ProvisionTenantRequest } from '../models/admin.models';
import { buildProvisionRequest, provisionRequestHasTenantId } from '../utils/admin-provision.util';
import { AdminTenantsApiService } from './admin-tenants-api.service';

describe('AdminTenantsApiService', () => {
  let service: AdminTenantsApiService;
  let api: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'post', 'put']);
    TestBed.configureTestingModule({
      providers: [AdminTenantsApiService, { provide: ApiService, useValue: api }]
    });
    service = TestBed.inject(AdminTenantsApiService);
  });

  it('GETs tenant list URL', () => {
    api.get.and.returnValue(of({ success: true, message: '', data: [], errors: [] }));
    service.getTenants().subscribe();
    expect(api.get).toHaveBeenCalledWith('/admin/tenants');
  });

  it('GETs tenant detail URL', () => {
    api.get.and.returnValue(of({ success: true, message: '', data: { tenantId: 9 }, errors: [] }));
    service.getTenant(9).subscribe();
    expect(api.get).toHaveBeenCalledWith('/admin/tenants/9');
  });

  it('POSTs provision URL once with nested request and no tenantId', () => {
    api.post.and.returnValue(
      of({
        success: true,
        message: '',
        data: { tenantId: 2, branchId: 3, adminUserId: 4, subscriptionId: 5, tenantCode: 'ACME', adminUsername: 'acme.admin' },
        errors: []
      })
    );

    const request = sampleProvisionRequest();
    expect(provisionRequestHasTenantId(request)).toBeFalse();
    expect(request.admin.password).toBe('Password1');
    expect((request.admin as { passwordHash?: string }).passwordHash).toBeUndefined();

    service.provisionTenant(request).subscribe();
    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/admin/tenants/provision', request);
  });

  it('PUTs tenant update URL', () => {
    api.put.and.returnValue(of({ success: true, message: '', data: { tenantId: 9 }, errors: [] }));
    service.updateTenant(9, {
      tenantCode: 'ACME',
      tenantName: 'Acme',
      tenantType: 'Clinic',
      status: 'Active'
    }).subscribe();
    expect(api.put).toHaveBeenCalledWith('/admin/tenants/9', {
      tenantCode: 'ACME',
      tenantName: 'Acme',
      tenantType: 'Clinic',
      status: 'Active'
    });
  });

  it('POSTs activate URL', () => {
    api.post.and.returnValue(of({ success: true, message: '', data: null, errors: [] }));
    service.activateTenant(9).subscribe();
    expect(api.post).toHaveBeenCalledWith('/admin/tenants/9/activate', {});
  });

  it('POSTs suspend URL', () => {
    api.post.and.returnValue(of({ success: true, message: '', data: null, errors: [] }));
    service.suspendTenant(9).subscribe();
    expect(api.post).toHaveBeenCalledWith('/admin/tenants/9/suspend', {});
  });
});

function sampleProvisionRequest(): ProvisionTenantRequest {
  return buildProvisionRequest({
    tenant: {
      tenantCode: 'ACME',
      tenantName: 'Acme Clinic',
      tenantType: 'Clinic',
      email: 'ops@acme.local',
      phone: '',
      address: '',
      timeZone: 'Asia/Kolkata',
      currencyCode: 'INR'
    },
    admin: {
      username: 'acme.admin',
      firstName: 'Ada',
      lastName: 'Admin',
      email: 'ada@acme.local',
      password: 'Password1'
    },
    branch: {
      branchCode: 'MAIN',
      branchName: 'Main',
      address: '',
      phone: '',
      email: ''
    },
    planId: 1,
    billingCycle: 'MONTHLY',
    moduleCodes: ['HRMS'],
    featureCodes: ['HRMS_EMPLOYEE']
  });
}
