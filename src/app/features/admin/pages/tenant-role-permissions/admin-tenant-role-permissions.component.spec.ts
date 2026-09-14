import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PermissionDto, RoleDto } from '../../../roles/models/role.model';
import { ModuleService } from '../../../modules/services/module.service';
import { AdminTenantRolesApiService } from '../../services/admin-tenant-roles-api.service';
import { AdminTenantRolePermissionsComponent } from './admin-tenant-role-permissions.component';

describe('AdminTenantRolePermissionsComponent', () => {
  let fixture: ComponentFixture<AdminTenantRolePermissionsComponent>;
  let component: AdminTenantRolePermissionsComponent;
  let rolesApi: jasmine.SpyObj<AdminTenantRolesApiService>;

  beforeEach(async () => {
    rolesApi = jasmine.createSpyObj<AdminTenantRolesApiService>('AdminTenantRolesApiService', [
      'getRole',
      'getRolePermissions',
      'getPermissionCatalog',
      'assignRolePermissions'
    ]);
    rolesApi.getRole.and.returnValue(of(sampleRole(false)));
    rolesApi.getRolePermissions.and.returnValue(of([]));
    rolesApi.getPermissionCatalog.and.returnValue(
      of([
        { permissionId: 1, moduleId: 1, permissionCode: 'PLATFORM_ADMIN', permissionName: 'Platform' },
        { permissionId: 2, moduleId: 1, permissionCode: 'USER_VIEW', permissionName: 'View users' }
      ] as PermissionDto[])
    );
    rolesApi.assignRolePermissions.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [AdminTenantRolePermissionsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '2002', roleId: '7' }) } }
        },
        { provide: AdminTenantRolesApiService, useValue: rolesApi },
        { provide: ModuleService, useValue: { getList: () => of({ data: [] }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTenantRolePermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads catalog and role endpoints for the route tenant', () => {
    expect(rolesApi.getRole).toHaveBeenCalledWith(2002, 7);
    expect(rolesApi.getPermissionCatalog).toHaveBeenCalled();
    expect(component.catalog().map((item) => item.permissionCode)).toEqual(['USER_VIEW']);
  });

  it('saves replace-all permission ids without PLATFORM_ADMIN', () => {
    component.toggle(2, true);
    component.save();
    expect(rolesApi.assignRolePermissions).toHaveBeenCalledWith(2002, 7, { permissionIds: [2] });
  });
});

describe('AdminTenantRolePermissionsComponent system role', () => {
  it('locks TENANT_ADMIN permissions', async () => {
    const rolesApi = jasmine.createSpyObj<AdminTenantRolesApiService>('AdminTenantRolesApiService', [
      'getRole',
      'getRolePermissions',
      'getPermissionCatalog',
      'assignRolePermissions'
    ]);
    rolesApi.getRole.and.returnValue(
      of({
        roleId: 7,
        tenantId: 2002,
        roleCode: 'TENANT_ADMIN',
        roleName: 'Tenant Admin',
        isSystemRole: true,
        isActive: true,
        createdDate: '',
        permissions: []
      } as RoleDto)
    );
    rolesApi.getRolePermissions.and.returnValue(of([]));
    rolesApi.getPermissionCatalog.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AdminTenantRolePermissionsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '2002', roleId: '7' }) } }
        },
        { provide: AdminTenantRolesApiService, useValue: rolesApi },
        { provide: ModuleService, useValue: { getList: () => of({ data: [] }) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminTenantRolePermissionsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.locked()).toBeTrue();
    fixture.componentInstance.save();
    expect(rolesApi.assignRolePermissions).not.toHaveBeenCalled();
  });
});

function sampleRole(isSystemRole: boolean): RoleDto {
  return {
    roleId: 7,
    tenantId: 2002,
    roleCode: 'BILLING_CLERK',
    roleName: 'Billing Clerk',
    isSystemRole,
    isActive: true,
    createdDate: '',
    permissions: []
  };
}
