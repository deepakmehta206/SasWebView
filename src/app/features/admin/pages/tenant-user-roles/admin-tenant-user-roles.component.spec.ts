import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BranchService } from '../../../branch/services/branch.service';
import { RoleDto } from '../../../roles/models/role.model';
import { UserDto } from '../../../users/models/user.model';
import { AdminTenantRolesApiService } from '../../services/admin-tenant-roles-api.service';
import { AdminTenantUsersApiService } from '../../services/admin-tenant-users-api.service';
import { AdminTenantUserRolesComponent } from './admin-tenant-user-roles.component';

describe('AdminTenantUserRolesComponent', () => {
  let fixture: ComponentFixture<AdminTenantUserRolesComponent>;
  let component: AdminTenantUserRolesComponent;
  let usersApi: jasmine.SpyObj<AdminTenantUsersApiService>;
  let rolesApi: jasmine.SpyObj<AdminTenantRolesApiService>;

  beforeEach(async () => {
    usersApi = jasmine.createSpyObj<AdminTenantUsersApiService>('AdminTenantUsersApiService', [
      'getUser',
      'getUsers',
      'assignUserRoles'
    ]);
    rolesApi = jasmine.createSpyObj<AdminTenantRolesApiService>('AdminTenantRolesApiService', ['getRoles']);
    usersApi.getUser.and.returnValue(of(sampleUser()));
    usersApi.getUsers.and.returnValue(of([sampleUser()]));
    usersApi.assignUserRoles.and.returnValue(of(null));
    rolesApi.getRoles.and.returnValue(
      of([
        {
          roleId: 99,
          tenantId: null,
          roleCode: 'PLATFORM_ADMIN',
          roleName: 'Platform',
          isSystemRole: true,
          isActive: true,
          createdDate: '',
          permissions: []
        },
        {
          roleId: 7,
          tenantId: 2002,
          roleCode: 'TENANT_ADMIN',
          roleName: 'Tenant Admin',
          isSystemRole: true,
          isActive: true,
          createdDate: '',
          permissions: []
        }
      ] as RoleDto[])
    );

    await TestBed.configureTestingModule({
      imports: [AdminTenantUserRolesComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '2002', userId: '1' }) } }
        },
        { provide: AdminTenantUsersApiService, useValue: usersApi },
        { provide: AdminTenantRolesApiService, useValue: rolesApi },
        { provide: BranchService, useValue: { getList: () => of({ data: [] }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTenantUserRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not offer PLATFORM_ADMIN as an assignable role', () => {
    expect(component.roles().map((role) => role.roleCode)).toEqual(['TENANT_ADMIN']);
  });

  it('PUTs replace-all roles for the route tenant', () => {
    component.roleAssignments.clear();
    component.addRoleRow(7, null);
    component.save();
    expect(usersApi.assignUserRoles).toHaveBeenCalledWith(2002, 1, { roles: [{ roleId: 7, branchId: null }] });
  });
});

function sampleUser(): UserDto {
  return {
    userId: 1,
    tenantId: 2002,
    username: 'clinic.user',
    firstName: 'Clinic',
    status: 'Active',
    isActive: true,
    createdDate: '',
    roles: []
  };
}
