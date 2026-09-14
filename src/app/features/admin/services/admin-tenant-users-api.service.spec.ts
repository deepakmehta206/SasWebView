import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { CreateUserRequest, UpdateUserRequest } from '../../users/models/user.model';
import { requestHasTenantId } from '../utils/admin-iam.util';
import { AdminTenantUsersApiService } from './admin-tenant-users-api.service';

describe('AdminTenantUsersApiService', () => {
  let service: AdminTenantUsersApiService;
  let api: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<ApiService>('ApiService', ['get', 'post', 'put']);
    TestBed.configureTestingModule({
      providers: [AdminTenantUsersApiService, { provide: ApiService, useValue: api }]
    });
    service = TestBed.inject(AdminTenantUsersApiService);
  });

  it('GETs users for the route tenant', () => {
    api.get.and.returnValue(of({ success: true, message: '', data: [], errors: [] }));
    service.getUsers(2002).subscribe();
    expect(api.get).toHaveBeenCalledWith('/admin/tenants/2002/users');
  });

  it('GETs user detail URL', () => {
    api.get.and.returnValue(of({ success: true, message: '', data: { userId: 5 }, errors: [] }));
    service.getUser(2002, 5).subscribe();
    expect(api.get).toHaveBeenCalledWith('/admin/tenants/2002/users/5');
  });

  it('POSTs create user without tenantId in the body', () => {
    api.post.and.returnValue(of({ success: true, message: '', data: { userId: 5 }, errors: [] }));
    const request: CreateUserRequest = {
      username: 'clinic.user',
      password: 'ChangeMe!1',
      firstName: 'Clinic',
      status: 'Active'
    };
    expect(requestHasTenantId(request)).toBeFalse();
    service.createUser(2002, request).subscribe();
    expect(api.post).toHaveBeenCalledWith('/admin/tenants/2002/users', request);
  });

  it('PUTs update user without tenantId or password', () => {
    api.put.and.returnValue(of({ success: true, message: '', data: { userId: 5 }, errors: [] }));
    const request: UpdateUserRequest = {
      username: 'clinic.user',
      firstName: 'Clinic',
      status: 'Active'
    };
    expect(requestHasTenantId(request)).toBeFalse();
    expect((request as { password?: string }).password).toBeUndefined();
    service.updateUser(2002, 5, request).subscribe();
    expect(api.put).toHaveBeenCalledWith('/admin/tenants/2002/users/5', request);
  });

  it('POSTs activate and deactivate', () => {
    api.post.and.returnValue(of({ success: true, message: '', data: null, errors: [] }));
    service.activateUser(2002, 5).subscribe();
    service.deactivateUser(2002, 5).subscribe();
    expect(api.post).toHaveBeenCalledWith('/admin/tenants/2002/users/5/activate', {});
    expect(api.post).toHaveBeenCalledWith('/admin/tenants/2002/users/5/deactivate', {});
  });

  it('GETs and PUTs user roles as replace-all', () => {
    api.get.and.returnValue(of({ success: true, message: '', data: [], errors: [] }));
    api.put.and.returnValue(of({ success: true, message: '', data: null, errors: [] }));
    service.getUserRoles(2002, 5).subscribe();
    service.assignUserRoles(2002, 5, { roles: [{ roleId: 7 }] }).subscribe();
    expect(api.get).toHaveBeenCalledWith('/admin/tenants/2002/users/5/roles');
    expect(api.put).toHaveBeenCalledWith('/admin/tenants/2002/users/5/roles', { roles: [{ roleId: 7 }] });
  });
});
