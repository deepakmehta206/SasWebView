/** Matches backend Feature DTOs (camelCase JSON). */

export interface FeatureDto {
  featureId: number;
  moduleId: number;
  moduleCode: string;
  featureCode: string;
  featureName: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateFeatureRequest {
  moduleId: number;
  featureCode: string;
  featureName: string;
  description?: string | null;
  displayOrder: number;
}

export interface UpdateFeatureRequest {
  moduleId: number;
  featureCode: string;
  featureName: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface TenantFeatureDto {
  tenantFeatureId?: number | null;
  tenantId: number;
  featureId: number;
  featureCode: string;
  featureName: string;
  moduleId: number;
  moduleCode: string;
  moduleName: string;
  isEnabled: boolean;
  enabledDate?: string | null;
  disabledDate?: string | null;
}

export interface SetTenantFeatureRequest {
  isEnabled: boolean;
}
