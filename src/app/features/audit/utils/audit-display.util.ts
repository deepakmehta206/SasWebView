/**
 * Display helpers for Phase 9 Audit UI.
 * Date display reuses notification util; UTC filter bounds live here.
 */

export function formatAuditCategoryLabel(category: string | null | undefined): string {
  if (!category?.trim()) {
    return '—';
  }

  switch (category.trim().toUpperCase()) {
    case 'SECURITY':
      return 'Security';
    case 'USER':
      return 'User';
    case 'ROLE':
      return 'Role';
    case 'TENANT':
      return 'Tenant';
    case 'BRANCH':
      return 'Branch';
    case 'SUBSCRIPTION':
      return 'Subscription';
    case 'FILE':
      return 'File';
    case 'HRMS':
      return 'HRMS';
    case 'LEAVE':
      return 'Leave';
    case 'PAYROLL':
      return 'Payroll';
    case 'SETTINGS':
      return 'Settings';
    case 'PLATFORM':
      return 'Platform';
    default:
      return category.trim();
  }
}

export function formatAuditActionLabel(action: string | null | undefined): string {
  if (!action?.trim()) {
    return '—';
  }

  return action
    .trim()
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatAuditEntity(
  entityType: string | null | undefined,
  entityId: string | null | undefined
): string {
  const type = entityType?.trim() || '';
  const id = entityId?.trim() || '';

  if (!type && !id) {
    return '—';
  }

  if (type && id) {
    return `${type} #${id}`;
  }

  return type || id;
}

export function formatAuditJson(value: string | null | undefined): string {
  if (value == null || value.trim() === '') {
    return '—';
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return value;
  }
}

/**
 * Converts a date-only input (YYYY-MM-DD) to UTC start-of-day for fromDate.
 */
export function toAuditFromDateUtc(dateOnly: string | null | undefined): string | undefined {
  const day = dateOnly?.trim();
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return undefined;
  }

  return `${day}T00:00:00.000Z`;
}

/**
 * Converts a date-only input (YYYY-MM-DD) to UTC end-of-day for toDate.
 */
export function toAuditToDateUtc(dateOnly: string | null | undefined): string | undefined {
  const day = dateOnly?.trim();
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    return undefined;
  }

  return `${day}T23:59:59.999Z`;
}

export function categoryPillModifier(category: string | null | undefined): string {
  switch ((category ?? '').trim().toUpperCase()) {
    case 'SECURITY':
      return 'status-pill--security';
    case 'FILE':
      return 'status-pill--file';
    case 'HRMS':
    case 'LEAVE':
    case 'PAYROLL':
      return 'status-pill--hrms';
    case 'USER':
    case 'ROLE':
      return 'status-pill--user';
    case 'PLATFORM':
      return 'status-pill--security';
    default:
      return 'status-pill--accent';
  }
}
