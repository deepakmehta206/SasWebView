/** Matches backend Module DTOs (camelCase JSON). */

export interface ModuleDto {
  moduleId: number;
  moduleCode: string;
  moduleName: string;
  description?: string | null;
  parentModuleId?: number | null;
  displayOrder: number;
  icon?: string | null;
  route?: string | null;
  isSystemModule: boolean;
  isActive: boolean;
}

export interface CreateModuleRequest {
  moduleCode: string;
  moduleName: string;
  description?: string | null;
  parentModuleId?: number | null;
  displayOrder: number;
  icon?: string | null;
  route?: string | null;
  isSystemModule: boolean;
}

export interface UpdateModuleRequest {
  moduleCode: string;
  moduleName: string;
  description?: string | null;
  parentModuleId?: number | null;
  displayOrder: number;
  icon?: string | null;
  route?: string | null;
  isSystemModule: boolean;
  isActive: boolean;
}

export interface TenantModuleDto {
  tenantModuleId?: number | null;
  tenantId: number;
  moduleId: number;
  moduleCode: string;
  moduleName: string;
  isSystemModule: boolean;
  isEnabled: boolean;
  enabledDate?: string | null;
  disabledDate?: string | null;
}

export interface SetTenantModuleRequest {
  isEnabled: boolean;
}
