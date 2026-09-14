import { FeatureDto } from '../../features/models/feature.model';
import { PlanFeatureDto } from '../../subscription/models/subscription.models';
import { CORE_MODULE_CODE } from '../models/admin.models';
import {
  buildProvisionRequest,
  canSubmitProvision,
  ensureCoreModule,
  filterFeaturesForWizard,
  isCoreModule,
  isFeatureAllowedByPlan,
  provisionRequestHasTenantId,
  pruneFeatureCodes
} from './admin-provision.util';

describe('admin-provision.util', () => {
  const features: FeatureDto[] = [
    {
      featureId: 1,
      moduleId: 2,
      moduleCode: 'HRMS',
      featureCode: 'HRMS_EMPLOYEE',
      featureName: 'Employees',
      displayOrder: 1,
      isActive: true
    },
    {
      featureId: 2,
      moduleId: 3,
      moduleCode: 'BILLING',
      featureCode: 'BILLING_INVOICE',
      featureName: 'Invoices',
      displayOrder: 1,
      isActive: true
    },
    {
      featureId: 3,
      moduleId: 2,
      moduleCode: 'HRMS',
      featureCode: 'HRMS_PAYROLL',
      featureName: 'Payroll',
      displayOrder: 2,
      isActive: false
    }
  ];

  const planFeatures: PlanFeatureDto[] = [
    { featureId: 1, featureCode: 'HRMS_EMPLOYEE', isEnabled: true },
    { featureId: 2, featureCode: 'BILLING_INVOICE', isEnabled: false }
  ];

  it('locks CORE as selected and non-removable', () => {
    expect(ensureCoreModule(['HRMS'])).toEqual([CORE_MODULE_CODE, 'HRMS']);
    expect(isCoreModule('core')).toBeTrue();
    expect(isCoreModule('HRMS')).toBeFalse();
  });

  it('filters features by selected modules', () => {
    const filtered = filterFeaturesForWizard(features, ['HRMS']);
    expect(filtered.map((item) => item.featureCode)).toEqual(['HRMS_EMPLOYEE']);
  });

  it('respects plan feature restrictions', () => {
    expect(isFeatureAllowedByPlan('HRMS_EMPLOYEE', planFeatures)).toBeTrue();
    expect(isFeatureAllowedByPlan('BILLING_INVOICE', planFeatures)).toBeFalse();
    expect(pruneFeatureCodes(['HRMS_EMPLOYEE', 'BILLING_INVOICE'], features, planFeatures)).toEqual([
      'HRMS_EMPLOYEE'
    ]);
  });

  it('builds a nested provision request without tenantId and with admin.password only', () => {
    const request = buildProvisionRequest({
      tenant: {
        tenantCode: 'ACME',
        tenantName: 'Acme',
        tenantType: 'Clinic',
        email: 'ops@acme.local',
        phone: '',
        address: '',
        timeZone: '',
        currencyCode: 'INR'
      },
      admin: {
        username: 'acme.admin',
        firstName: 'Ada',
        lastName: '',
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
      planId: 7,
      billingCycle: 'YEARLY',
      moduleCodes: ['HRMS'],
      featureCodes: ['HRMS_EMPLOYEE']
    });

    expect(provisionRequestHasTenantId(request)).toBeFalse();
    expect(request.tenant.tenantCode).toBe('ACME');
    expect(request.branch.branchCode).toBe('MAIN');
    expect(request.admin.username).toBe('acme.admin');
    expect(request.admin.password).toBe('Password1');
    expect(request.subscription).toEqual({ planId: 7, billingCycle: 'YEARLY' });
    expect(request.moduleCodes).toEqual([CORE_MODULE_CODE, 'HRMS']);
    expect(request.featureCodes).toEqual(['HRMS_EMPLOYEE']);
    expect((request as { tenantId?: number }).tenantId).toBeUndefined();
    expect((request.admin as { passwordHash?: string }).passwordHash).toBeUndefined();
  });

  it('prevents double submit while a request is in flight', () => {
    expect(canSubmitProvision(false)).toBeTrue();
    expect(canSubmitProvision(true)).toBeFalse();
  });
});
