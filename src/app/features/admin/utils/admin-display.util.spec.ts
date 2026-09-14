import {
  canActivateTenant,
  canSuspendTenant,
  dash,
  formatSubscriptionStatus,
  formatTenantStatus,
  formatTenantType,
  tenantStatusClass
} from './admin-display.util';

describe('admin-display.util', () => {
  it('formats tenant status and type', () => {
    expect(formatTenantStatus('Active')).toBe('Active');
    expect(formatTenantStatus('')).toBe('—');
    expect(formatTenantType('Clinic')).toBe('Clinic');
    expect(formatTenantType(null)).toBe('—');
    expect(formatSubscriptionStatus('TRIAL')).toBe('TRIAL');
    expect(formatSubscriptionStatus(undefined)).toBe('—');
    expect(dash(null)).toBe('—');
    expect(dash('INR')).toBe('INR');
  });

  it('maps status classes', () => {
    expect(tenantStatusClass('Active', true)).toContain('status-badge--active');
    expect(tenantStatusClass('Suspended', false)).toContain('status-badge--inactive');
  });

  it('shows activate/suspend only when appropriate', () => {
    expect(canActivateTenant('Suspended', false)).toBeTrue();
    expect(canActivateTenant('Active', true)).toBeFalse();
    expect(canSuspendTenant('Active', true)).toBeTrue();
    expect(canSuspendTenant('Suspended', false)).toBeFalse();
  });
});
