/** Matches backend TenantSettingDto (camelCase JSON). */
export interface TenantSettingDto {
  tenantSettingId: number;
  tenantId: number;
  settingKey: string;
  settingValue?: string | null;
  dataType?: string | null;
  createdDate: string;
  modifiedDate?: string | null;
}

/** Matches backend SaveTenantSettingRequest. */
export interface SaveTenantSettingRequest {
  settingValue?: string | null;
  dataType?: string | null;
}
