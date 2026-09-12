/** Matches backend subscription/plan DTOs (camelCase). */

export interface PlanFeatureDto {
  featureId: number;
  featureCode: string;
  isEnabled: boolean;
}

export interface PlanDto {
  planId: number;
  planCode: string;
  planName: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  currencyCode: string;
  trialDays: number;
  maxUsers: number | null;
  maxBranches: number | null;
  maxStorageMB: number | null;
  isActive: boolean;
  features: PlanFeatureDto[];
}

export interface TenantSubscriptionDto {
  subscriptionId: number;
  tenantId: number;
  planId: number;
  planCode: string;
  planName: string;
  billingCycle: string;
  startDate: string;
  endDate: string | null;
  trialStartDate: string | null;
  trialEndDate: string | null;
  status: string;
  autoRenew: boolean;
  cancelledDate: string | null;
  pendingPlanId: number | null;
  pendingBillingCycle: string | null;
  pendingEffectiveDate: string | null;
  maxUsers: number | null;
  maxBranches: number | null;
  maxStorageMB: number | null;
  tenantCode: string | null;
}

export interface ChangePlanRequest {
  targetPlanId: number;
  billingCycle?: string | null;
  reason?: string | null;
}

export interface CancelSubscriptionRequest {
  reason?: string | null;
  preserveAccessUntilPeriodEnd?: boolean;
}

export interface RenewSubscriptionRequest {
  billingCycle?: string | null;
}

export interface TenantUsageDto {
  tenantId: number;
  activeUsers: number;
  branches: number;
  storageUsedMB: number;
  updatedDate: string;
}

export interface SubscriptionLimitsDto {
  maxUsers: number | null;
  maxBranches: number | null;
  maxStorageMB: number | null;
  activeUsers: number;
  branches: number;
  storageUsedMB: number;
  canCreateUser: boolean;
  canCreateBranch: boolean;
  subscriptionStatus: string | null;
  planCode: string | null;
}

export interface SubscriptionInvoiceDto {
  invoiceId: number;
  invoiceNumber: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currencyCode: string;
  status: string;
  dueDate: string | null;
  paidDate: string | null;
}

/** Result of upgrade/downgrade/cancel/renew including scheduled-downgrade success. */
export interface SubscriptionChangeResult {
  subscription: TenantSubscriptionDto | null;
  scheduledDowngrade: boolean;
  message: string | null;
}
