/** Mirrors SaaSPlatform.Application.DTOs.Platform — Phase 12A. */

export interface PlatformTenantListItem {
  tenantId: number;
  tenantCode: string;
  tenantName: string;
  tenantType: string;
  email: string | null;
  phone: string | null;
  status: string;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string | null;
  subscriptionId: number | null;
  planId: number | null;
  planCode: string | null;
  planName: string | null;
  subscriptionStatus: string | null;
  billingCycle: string | null;
}

export interface PlatformTenantDetail {
  tenantId: number;
  tenantCode: string;
  tenantName: string;
  tenantType: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  timeZone: string | null;
  currencyCode: string | null;
  status: string;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string | null;
  subscriptionId: number | null;
  planId: number | null;
  planCode: string | null;
  planName: string | null;
  subscriptionStatus: string | null;
  billingCycle: string | null;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  trialStartDate: string | null;
  trialEndDate: string | null;
}

export interface ProvisionTenantInfo {
  tenantCode: string;
  tenantName: string;
  tenantType: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  timeZone?: string | null;
  currencyCode?: string | null;
}

export interface ProvisionBranchInfo {
  branchCode: string;
  branchName: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface ProvisionAdminInfo {
  username: string;
  firstName: string;
  password: string;
  email?: string | null;
  lastName?: string | null;
}

export interface ProvisionSubscriptionInfo {
  planId: number;
  billingCycle: string;
}

export interface ProvisionTenantRequest {
  tenant: ProvisionTenantInfo;
  branch: ProvisionBranchInfo;
  admin: ProvisionAdminInfo;
  subscription: ProvisionSubscriptionInfo;
  moduleCodes: string[];
  featureCodes: string[];
}

export interface ProvisionTenantResponse {
  tenantId: number;
  branchId: number;
  adminUserId: number;
  subscriptionId: number;
  tenantCode: string;
  adminUsername: string;
}

export interface PlatformTenantUpdateRequest {
  tenantCode: string;
  tenantName: string;
  tenantType: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  timeZone?: string | null;
  currencyCode?: string | null;
  status: string;
}

export const CORE_MODULE_CODE = 'CORE';

export const BILLING_CYCLES = ['MONTHLY', 'YEARLY'] as const;

export type BillingCycle = (typeof BILLING_CYCLES)[number];

export const PROVISION_STEPS = [
  'Tenant',
  'Admin User',
  'Initial Branch',
  'Subscription',
  'Modules',
  'Features',
  'Review',
  'Provision'
] as const;
