import { PlanFeatureDto } from '../../subscription/models/subscription.models';
import { FeatureDto } from '../../features/models/feature.model';
import {
  CORE_MODULE_CODE,
  ProvisionTenantRequest
} from '../models/admin.models';

export function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length === 0 ? null : trimmed;
}

export function ensureCoreModule(moduleCodes: readonly string[]): string[] {
  const unique = [
    ...new Set(moduleCodes.map((code) => code.trim()).filter((code) => code.length > 0))
  ];
  if (!unique.includes(CORE_MODULE_CODE)) {
    return [CORE_MODULE_CODE, ...unique];
  }
  return unique;
}

export function isCoreModule(moduleCode: string): boolean {
  return moduleCode.trim().toUpperCase() === CORE_MODULE_CODE;
}

export function isFeatureAllowedByPlan(
  featureCode: string,
  planFeatures: readonly PlanFeatureDto[] | null | undefined
): boolean {
  if (!planFeatures?.length) {
    return true;
  }

  return planFeatures.some((item) => item.featureCode === featureCode && item.isEnabled);
}

export function filterFeaturesForWizard(
  features: readonly FeatureDto[],
  selectedModuleCodes: readonly string[]
): FeatureDto[] {
  const modules = new Set(selectedModuleCodes);
  return features.filter((feature) => feature.isActive && modules.has(feature.moduleCode));
}

export function pruneFeatureCodes(
  featureCodes: readonly string[],
  allowedFeatures: readonly FeatureDto[],
  planFeatures?: readonly PlanFeatureDto[] | null
): string[] {
  const allowed = new Set(allowedFeatures.map((feature) => feature.featureCode));
  return featureCodes.filter(
    (code) => allowed.has(code) && isFeatureAllowedByPlan(code, planFeatures)
  );
}

export function canSubmitProvision(submitting: boolean): boolean {
  return !submitting;
}

export function buildProvisionRequest(input: {
  tenant: {
    tenantCode: string;
    tenantName: string;
    tenantType: string;
    email: string;
    phone: string;
    address: string;
    timeZone: string;
    currencyCode: string;
  };
  admin: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
  branch: {
    branchCode: string;
    branchName: string;
    address: string;
    phone: string;
    email: string;
  };
  planId: number;
  billingCycle: string;
  moduleCodes: readonly string[];
  featureCodes: readonly string[];
}): ProvisionTenantRequest {
  const request: ProvisionTenantRequest = {
    tenant: {
      tenantCode: input.tenant.tenantCode.trim(),
      tenantName: input.tenant.tenantName.trim(),
      tenantType: input.tenant.tenantType.trim(),
      email: emptyToNull(input.tenant.email),
      phone: emptyToNull(input.tenant.phone),
      address: emptyToNull(input.tenant.address),
      timeZone: emptyToNull(input.tenant.timeZone),
      currencyCode: emptyToNull(input.tenant.currencyCode)
    },
    branch: {
      branchCode: input.branch.branchCode.trim(),
      branchName: input.branch.branchName.trim(),
      address: emptyToNull(input.branch.address),
      phone: emptyToNull(input.branch.phone),
      email: emptyToNull(input.branch.email)
    },
    admin: {
      username: input.admin.username.trim(),
      firstName: input.admin.firstName.trim(),
      lastName: emptyToNull(input.admin.lastName),
      email: emptyToNull(input.admin.email),
      password: input.admin.password
    },
    subscription: {
      planId: input.planId,
      billingCycle: input.billingCycle.trim()
    },
    moduleCodes: ensureCoreModule(input.moduleCodes),
    featureCodes: [...new Set(input.featureCodes.map((code) => code.trim()).filter(Boolean))]
  };

  return request;
}

export function provisionRequestHasTenantId(request: ProvisionTenantRequest): boolean {
  return Object.prototype.hasOwnProperty.call(request, 'tenantId');
}
