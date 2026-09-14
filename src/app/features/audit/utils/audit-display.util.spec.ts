import {
  categoryPillModifier,
  formatAuditActionLabel,
  formatAuditCategoryLabel,
  formatAuditEntity,
  formatAuditJson,
  toAuditFromDateUtc,
  toAuditToDateUtc
} from './audit-display.util';

describe('audit-display.util', () => {
  it('formats null/empty JSON as em dash', () => {
    expect(formatAuditJson(null)).toBe('—');
    expect(formatAuditJson(undefined)).toBe('—');
    expect(formatAuditJson('')).toBe('—');
    expect(formatAuditJson('   ')).toBe('—');
  });

  it('pretty-prints valid JSON', () => {
    expect(formatAuditJson('{"status":"Active"}')).toBe('{\n  "status": "Active"\n}');
  });

  it('returns original string for malformed JSON', () => {
    expect(formatAuditJson('{not-json')).toBe('{not-json');
  });

  it('formats category labels', () => {
    expect(formatAuditCategoryLabel('SECURITY')).toBe('Security');
    expect(formatAuditCategoryLabel('HRMS')).toBe('HRMS');
    expect(formatAuditCategoryLabel('PLATFORM')).toBe('Platform');
    expect(formatAuditCategoryLabel(null)).toBe('—');
  });

  it('formats action labels', () => {
    expect(formatAuditActionLabel('LOGIN_SUCCESS')).toBe('Login Success');
    expect(formatAuditActionLabel('FILE_UPLOADED')).toBe('File Uploaded');
    expect(formatAuditActionLabel('')).toBe('—');
  });

  it('formats entity display', () => {
    expect(formatAuditEntity('User', '10')).toBe('User #10');
    expect(formatAuditEntity('User', null)).toBe('User');
    expect(formatAuditEntity(null, '10')).toBe('10');
    expect(formatAuditEntity(null, null)).toBe('—');
  });

  it('serializes date-only filters to UTC bounds', () => {
    expect(toAuditFromDateUtc('2026-09-01')).toBe('2026-09-01T00:00:00.000Z');
    expect(toAuditToDateUtc('2026-09-01')).toBe('2026-09-01T23:59:59.999Z');
    expect(toAuditFromDateUtc('')).toBeUndefined();
    expect(toAuditToDateUtc('bad')).toBeUndefined();
  });

  it('maps category pill modifiers', () => {
    expect(categoryPillModifier('SECURITY')).toBe('status-pill--security');
    expect(categoryPillModifier('FILE')).toBe('status-pill--file');
    expect(categoryPillModifier('UNKNOWN')).toBe('status-pill--accent');
    expect(categoryPillModifier('PLATFORM')).toBe('status-pill--security');
  });
});
