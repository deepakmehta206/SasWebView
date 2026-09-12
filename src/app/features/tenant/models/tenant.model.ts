/** Matches backend TenantDto (camelCase JSON). */
export interface TenantDto {
  tenantId: number;
  tenantCode: string;
  tenantName: string;
  tenantType: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  timeZone?: string | null;
  currencyCode?: string | null;
  status: string;
  isActive: boolean;
  createdDate: string;
  modifiedDate?: string | null;
}

/** Matches backend UpdateTenantRequest. */
export interface UpdateTenantRequest {
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

/** Matches backend CreateTenantRequest. */
export interface CreateTenantRequest {
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

/** Matches backend SetStatusRequest. */
export interface SetStatusRequest {
  status: string;
  isActive: boolean;
}

export const TENANT_TYPE_OPTIONS = ['Hospital', 'School', 'Clinic', 'Generic'] as const;

export const ENTITY_STATUS_OPTIONS = ['Active', 'Inactive', 'Suspended'] as const;
