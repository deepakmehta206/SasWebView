import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { MasterApiService } from '../../../masters/services/master-api.service';
import { ModuleService } from '../../../modules/services/module.service';
import { FeatureCatalogService } from '../../../features/services/feature-catalog.service';
import { PlanService } from '../../../subscription/services/plan.service';
import { AdminTenantsApiService } from '../../services/admin-tenants-api.service';
import { TenantProvisionComponent } from './tenant-provision.component';

describe('TenantProvisionComponent', () => {
  let component: TenantProvisionComponent;
  let tenantsApi: jasmine.SpyObj<AdminTenantsApiService>;

  beforeEach(async () => {
    tenantsApi = jasmine.createSpyObj<AdminTenantsApiService>('AdminTenantsApiService', ['provisionTenant']);
    await TestBed.configureTestingModule({
      imports: [TenantProvisionComponent],
      providers: [
        provideRouter([]),
        { provide: AdminTenantsApiService, useValue: tenantsApi },
        { provide: PlanService, useValue: { getList: () => of([]) } },
        { provide: ModuleService, useValue: { getList: () => of({ data: [] }) } },
        { provide: FeatureCatalogService, useValue: { getList: () => of({ data: [] }) } },
        { provide: MasterApiService, useValue: { getList: () => of([]) } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(TenantProvisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('requires tenant code, name and type', () => {
    component.tenantForm.patchValue({ tenantCode: '', tenantName: '', tenantType: '' });
    component.next();
    expect(component.step()).toBe(0);
    expect(component.tenantForm.invalid).toBeTrue();
  });

  it('requires admin password of at least 8 characters', () => {
    component.tenantForm.patchValue({ tenantCode: 'ACME', tenantName: 'Acme', tenantType: 'Clinic' });
    component.next();
    component.adminForm.patchValue({
      username: 'acme.admin',
      firstName: 'Ada',
      password: 'short',
      confirmPassword: 'short'
    });
    component.next();
    expect(component.step()).toBe(1);
    expect(component.adminForm.controls.password.invalid).toBeTrue();
  });

  it('requires branch code and name', () => {
    fillValidThroughAdmin(component);
    component.branchForm.patchValue({ branchCode: '', branchName: '' });
    component.next();
    expect(component.step()).toBe(2);
    expect(component.branchForm.invalid).toBeTrue();
  });

  it('requires a plan before continuing', () => {
    fillValidThroughBranch(component);
    component.subscriptionForm.patchValue({ planId: 0, billingCycle: 'MONTHLY' });
    component.next();
    expect(component.step()).toBe(3);
    expect(component.subscriptionForm.invalid).toBeTrue();
  });

  it('prevents a second provision POST while submitting', () => {
    fillValidThroughPlan(component);
    component.step.set(7);
    const pending = new Subject<never>();
    tenantsApi.provisionTenant.and.returnValue(pending.asObservable());

    component.provision();
    component.provision();

    expect(tenantsApi.provisionTenant).toHaveBeenCalledTimes(1);
    const body = tenantsApi.provisionTenant.calls.mostRecent().args[0];
    expect(Object.prototype.hasOwnProperty.call(body, 'tenantId')).toBeFalse();
    expect(body.admin.password).toBe('Password1');
  });
});

function fillValidThroughAdmin(component: TenantProvisionComponent): void {
  component.tenantForm.patchValue({ tenantCode: 'ACME', tenantName: 'Acme', tenantType: 'Clinic' });
  component.next();
  component.adminForm.patchValue({
    username: 'acme.admin',
    firstName: 'Ada',
    lastName: 'Admin',
    email: 'ada@acme.local',
    password: 'Password1',
    confirmPassword: 'Password1'
  });
  component.next();
}

function fillValidThroughBranch(component: TenantProvisionComponent): void {
  fillValidThroughAdmin(component);
  component.branchForm.patchValue({ branchCode: 'MAIN', branchName: 'Main' });
  component.next();
}

function fillValidThroughPlan(component: TenantProvisionComponent): void {
  fillValidThroughBranch(component);
  component.subscriptionForm.patchValue({ planId: 4, billingCycle: 'MONTHLY' });
  component.next();
  component.next();
  component.next();
  component.next();
}
