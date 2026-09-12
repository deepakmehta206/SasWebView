/** Matches backend EffectiveEntitlementsDto from GET /me/entitlements (camelCase). */

export interface EffectiveEntitlementFeatureDto {
  code: string;
  available: boolean;
}

export interface EffectiveEntitlementModuleDto {
  code: string;
  name: string;
  available: boolean;
  features: EffectiveEntitlementFeatureDto[];
}

export interface EffectiveEntitlementsDto {
  subscriptionStatus: string | null;
  planCode: string | null;
  maxUsers: number | null;
  maxBranches: number | null;
  maxStorageMB: number | null;
  activeUsers: number;
  branches: number;
  storageUsedMB: number;
  modules: EffectiveEntitlementModuleDto[];
}
