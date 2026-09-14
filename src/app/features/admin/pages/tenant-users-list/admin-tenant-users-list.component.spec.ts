import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { UserDto } from '../../../users/models/user.model';
import { AdminTenantsApiService } from '../../services/admin-tenants-api.service';
import { AdminTenantUsersApiService } from '../../services/admin-tenant-users-api.service';
import { AdminTenantUsersListComponent } from './admin-tenant-users-list.component';

describe('AdminTenantUsersListComponent', () => {
  let fixture: ComponentFixture<AdminTenantUsersListComponent>;
  let component: AdminTenantUsersListComponent;
  let usersApi: jasmine.SpyObj<AdminTenantUsersApiService>;

  beforeEach(async () => {
    usersApi = jasmine.createSpyObj<AdminTenantUsersApiService>('AdminTenantUsersApiService', [
      'getUsers',
      'activateUser',
      'deactivateUser'
    ]);
    usersApi.getUsers.and.returnValue(of([sampleUser()]));
    usersApi.activateUser.and.returnValue(of(null));
    usersApi.deactivateUser.and.returnValue(of(null));
    spyOn(window, 'confirm').and.returnValue(true);

    await TestBed.configureTestingModule({
      imports: [AdminTenantUsersListComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '2002' }) } } },
        { provide: AdminTenantUsersApiService, useValue: usersApi },
        { provide: AdminTenantsApiService, useValue: { getTenant: () => of({ tenantId: 2002, tenantName: 'Clinic' }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTenantUsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads users for the route tenant', () => {
    expect(usersApi.getUsers).toHaveBeenCalledWith(2002);
    expect(component.users().length).toBe(1);
  });

  it('deactivates with the admin activate/deactivate endpoints', () => {
    component.toggleStatus(sampleUser());
    expect(usersApi.deactivateUser).toHaveBeenCalledWith(2002, 1);
    expect(usersApi.activateUser).not.toHaveBeenCalled();
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
    createdDate: '2026-01-01T00:00:00Z',
    roles: []
  };
}
