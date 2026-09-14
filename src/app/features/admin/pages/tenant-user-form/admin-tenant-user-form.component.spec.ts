import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BranchService } from '../../../branch/services/branch.service';
import { AdminTenantRolesApiService } from '../../services/admin-tenant-roles-api.service';
import { AdminTenantUsersApiService } from '../../services/admin-tenant-users-api.service';
import { requestHasTenantId } from '../../utils/admin-iam.util';
import { AdminTenantUserFormComponent } from './admin-tenant-user-form.component';

describe('AdminTenantUserFormComponent', () => {
  let fixture: ComponentFixture<AdminTenantUserFormComponent>;
  let component: AdminTenantUserFormComponent;
  let usersApi: jasmine.SpyObj<AdminTenantUsersApiService>;

  beforeEach(async () => {
    usersApi = jasmine.createSpyObj<AdminTenantUsersApiService>('AdminTenantUsersApiService', [
      'createUser',
      'updateUser',
      'getUser'
    ]);
    usersApi.createUser.and.returnValue(of({ userId: 9, tenantId: 2002, username: 'clinic.user', firstName: 'Clinic', status: 'Active', isActive: true, createdDate: '', roles: [] }));

    await TestBed.configureTestingModule({
      imports: [AdminTenantUserFormComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '2002' }) } } },
        { provide: AdminTenantUsersApiService, useValue: usersApi },
        { provide: AdminTenantRolesApiService, useValue: { getRoles: () => of([]) } },
        { provide: BranchService, useValue: { getList: () => of({ data: [] }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTenantUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('requires an 8 character password on create', () => {
    component.form.patchValue({
      username: 'clinic.user',
      firstName: 'Clinic',
      password: 'short',
      confirmPassword: 'short',
      status: 'Active'
    });
    component.save();
    expect(usersApi.createUser).not.toHaveBeenCalled();
    expect(component.form.controls.password.invalid).toBeTrue();
  });

  it('creates a user for the route tenant without tenantId in the body', () => {
    component.form.patchValue({
      username: 'clinic.user',
      firstName: 'Clinic',
      password: 'ChangeMe!1',
      confirmPassword: 'ChangeMe!1',
      status: 'Active'
    });
    component.roleAssignments.clear();
    component.save();
    expect(usersApi.createUser).toHaveBeenCalledTimes(1);
    const [tenantId, request] = usersApi.createUser.calls.mostRecent().args;
    expect(tenantId).toBe(2002);
    expect(requestHasTenantId(request)).toBeFalse();
    expect(request.password).toBe('ChangeMe!1');
    expect((request as { tenantId?: number }).tenantId).toBeUndefined();
  });
});
