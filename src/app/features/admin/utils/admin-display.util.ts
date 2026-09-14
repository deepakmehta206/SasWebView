export function formatTenantStatus(status: string | null | undefined): string {
  const value = status?.trim();
  return value && value.length > 0 ? value : '—';
}

export function formatTenantType(tenantType: string | null | undefined): string {
  const value = tenantType?.trim();
  return value && value.length > 0 ? value : '—';
}

export function formatSubscriptionStatus(status: string | null | undefined): string {
  const value = status?.trim();
  return value && value.length > 0 ? value : '—';
}

export function tenantStatusClass(status: string | null | undefined, isActive?: boolean): string {
  const normalized = (status ?? '').trim().toLowerCase();
  if (normalized === 'suspended') {
    return 'status-badge status-badge--inactive';
  }
  if (normalized === 'active' || isActive === true) {
    return 'status-badge status-badge--active';
  }
  return 'status-badge';
}

export function canActivateTenant(status: string | null | undefined, isActive?: boolean): boolean {
  const normalized = (status ?? '').trim().toLowerCase();
  return normalized === 'suspended' || normalized === 'inactive' || isActive === false;
}

export function canSuspendTenant(status: string | null | undefined, isActive?: boolean): boolean {
  const normalized = (status ?? '').trim().toLowerCase();
  return normalized === 'active' || (isActive === true && normalized !== 'suspended');
}

export function dash(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—';
  }
  const text = String(value).trim();
  return text.length > 0 ? text : '—';
}
