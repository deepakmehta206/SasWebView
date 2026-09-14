import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { CreateRoleRequest, UpdateRoleRequest } from '../../roles/models/role.model';
import { requestHasTenantId } from '../utils/admin-iam.util';
import { AdminTenantRolesApiService } from './admin-tenant-roles-api.service';

describe('AdminTenantRolesApiService', () => {
  let service: AdminTenantRolesApiService;
  let api: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'post', 'put']);
    TestBed.configureTestingModule({
      providers: [AdminTenantRolesApiService, { provide: ApiService, useValue: api }]
    });
    service = TestBed.inject(AdminTenantRolesApiService);
  });

  it('GETs roles for the route tenant', () => {
    api.get.and.returnValue(of({ success: true, message: '', data: [], errors: [] }));
    service.getRoles(2002).subscribe();
    expect(api.get).toHaveBeenCalledWith('/admin/tenants/2002/roles');
  });

  it('GETs role detail URL', () => {
    api.get.and.returnValue(of({ success: true, message: '', data: { roleId: 7 }, errors: [] }));
    service.getRole(2002, 7).subscribe();
    expect(api.get).toHaveBeenCalledWith('/admin/tenants/2002/roles/7');
  });

  it('POSTs create role without tenantId in the body', () => {
    api.post.and.returnValue(of({ success: true, message: '', data: { roleId: 8 }, errors: [] }));
    const request: CreateRoleRequest = { roleCode: 'BILLING_CLERK', roleName: 'Billing Clerk' };
    expect(requestHasTenantId(request)).toBeFalse();
    service.createRole(2002, request).subscribe();
    expect(api.post).toHaveBeenCalledWith('/admin/tenants/2002/roles', request);
  });

  it('PUTs update role', () => {
    api.put.and.returnValue(of({ success: true, message: '', data: { roleId: 7 }, errors: [] }));
    const request: UpdateRoleRequest = {
      roleCode: 'BILLING_CLERK',
      roleName: 'Billing Clerk',
      isActive: true
    };
    service.updateRole(2002, 7, request).subscribe();
    expect(api.put).toHaveBeenCalledWith('/admin/tenants/2002/roles/7', request);
  });

  it('GETs and PUTs role permissions as replace-all', () => {
    api.get.and.returnValue(of({ success: true, message: '', data: [], errors: [] }));
    api.put.and.returnValue(of({ success: true, message: '', data: null, errors: [] }));
    service.getRolePermissions(2002, 7).subscribe();
    service.assignRolePermissions(2002, 7, { permissionIds: [2, 3] }).subscribe();
    expect(api.get).toHaveBeenCalledWith('/admin/tenants/2002/roles/7/permissions');
    expect(api.put).toHaveBeenCalledWith('/admin/tenants/2002/roles/7/permissions', {
      permissionIds: [2, 3]
    });
  });

  it('GETs permission catalog without a tenantId', () => {
    api.get.and.returnValue(of({ success: true, message: '', data: [], errors: [] }));
    service.getPermissionCatalog().subscribe();
    expect(api.get).toHaveBeenCalledWith('/admin/permissions');
  });
});
