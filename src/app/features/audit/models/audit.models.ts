/** Mirrors SaaSPlatform.Application.DTOs.Audit — Phase 9. */

export interface AuditLogListItem {
  auditLogId: number;
  tenantId: number | null;
  userId: number | null;
  branchId: number | null;
  category: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  description: string | null;
  ipAddress: string | null;
  correlationId: string | null;
  createdDate: string;
}

export interface AuditLog extends AuditLogListItem {
  oldValuesJson: string | null;
  newValuesJson: string | null;
  userAgent: string | null;
}

export interface AuditLogQuery {
  fromDate?: string;
  toDate?: string;
  userId?: number;
  action?: string;
  entityType?: string;
  entityId?: string;
  category?: string;
  skip?: number;
  take?: number;
}

/** Matches SaaSPlatform.Domain.Constants.AuditCategories */
export const AUDIT_CATEGORIES = [
  'SECURITY',
  'USER',
  'ROLE',
  'TENANT',
  'BRANCH',
  'SUBSCRIPTION',
  'FILE',
  'HRMS',
  'LEAVE',
  'PAYROLL',
  'SETTINGS',
  'PLATFORM'
] as const;

export type AuditCategory = (typeof AUDIT_CATEGORIES)[number];

/** Matches SaaSPlatform.Domain.Constants.AuditActions */
export const AUDIT_ACTIONS = [
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'LOGOUT',
  'PASSWORD_CHANGED',
  'PASSWORD_RESET_REQUESTED',
  'PASSWORD_RESET_COMPLETED',
  'USER_CREATED',
  'USER_UPDATED',
  'USER_STATUS_CHANGED',
  'USER_ROLE_ASSIGNED',
  'USER_ROLE_REMOVED',
  'ROLE_CREATED',
  'ROLE_UPDATED',
  'ROLE_STATUS_CHANGED',
  'ROLE_PERMISSIONS_CHANGED',
  'TENANT_CREATED',
  'TENANT_UPDATED',
  'TENANT_STATUS_CHANGED',
  'TENANT_PROVISIONED',
  'TENANT_ACTIVATED',
  'TENANT_SUSPENDED',
  'TENANT_ADMIN_CREATED',
  'BRANCH_CREATED',
  'BRANCH_UPDATED',
  'BRANCH_STATUS_CHANGED',
  'TENANT_SETTING_SAVED',
  'SUBSCRIPTION_UPGRADED',
  'SUBSCRIPTION_DOWNGRADED',
  'SUBSCRIPTION_CANCELLED',
  'SUBSCRIPTION_RENEWED',
  'SUBSCRIPTION_PLAN_ASSIGNED',
  'SUBSCRIPTION_STATUS_CHANGED',
  'FILE_UPLOADED',
  'FILE_DELETED',
  'EMPLOYEE_CREATED',
  'EMPLOYEE_UPDATED',
  'EMPLOYEE_STATUS_CHANGED',
  'EMPLOYEE_DOCUMENT_CREATED',
  'EMPLOYEE_DOCUMENT_DELETED',
  'LEAVE_APPROVED',
  'LEAVE_REJECTED',
  'PAYROLL_PROCESSED',
  'PAYROLL_APPROVED',
  'PAYROLL_LOCKED'
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ACTIONS_BY_CATEGORY: Record<AuditCategory, readonly string[]> = {
  SECURITY: [
    'LOGIN_SUCCESS',
    'LOGIN_FAILED',
    'LOGOUT',
    'PASSWORD_CHANGED',
    'PASSWORD_RESET_REQUESTED',
    'PASSWORD_RESET_COMPLETED'
  ],
  USER: [
    'USER_CREATED',
    'USER_UPDATED',
    'USER_STATUS_CHANGED',
    'USER_ROLE_ASSIGNED',
    'USER_ROLE_REMOVED'
  ],
  ROLE: ['ROLE_CREATED', 'ROLE_UPDATED', 'ROLE_STATUS_CHANGED', 'ROLE_PERMISSIONS_CHANGED'],
  TENANT: [
    'TENANT_CREATED',
    'TENANT_UPDATED',
    'TENANT_STATUS_CHANGED',
    'TENANT_PROVISIONED',
    'TENANT_ACTIVATED',
    'TENANT_SUSPENDED',
    'TENANT_ADMIN_CREATED'
  ],
  PLATFORM: [
    'TENANT_CREATED',
    'TENANT_PROVISIONED',
    'TENANT_ACTIVATED',
    'TENANT_SUSPENDED',
    'TENANT_ADMIN_CREATED',
    'USER_CREATED',
    'USER_UPDATED',
    'USER_STATUS_CHANGED',
    'USER_ROLE_ASSIGNED',
    'USER_ROLE_REMOVED',
    'ROLE_CREATED',
    'ROLE_UPDATED',
    'ROLE_STATUS_CHANGED',
    'ROLE_PERMISSIONS_CHANGED'
  ],
  BRANCH: ['BRANCH_CREATED', 'BRANCH_UPDATED', 'BRANCH_STATUS_CHANGED'],
  SETTINGS: ['TENANT_SETTING_SAVED'],
  SUBSCRIPTION: [
    'SUBSCRIPTION_UPGRADED',
    'SUBSCRIPTION_DOWNGRADED',
    'SUBSCRIPTION_CANCELLED',
    'SUBSCRIPTION_RENEWED',
    'SUBSCRIPTION_PLAN_ASSIGNED',
    'SUBSCRIPTION_STATUS_CHANGED'
  ],
  FILE: ['FILE_UPLOADED', 'FILE_DELETED'],
  HRMS: [
    'EMPLOYEE_CREATED',
    'EMPLOYEE_UPDATED',
    'EMPLOYEE_STATUS_CHANGED',
    'EMPLOYEE_DOCUMENT_CREATED',
    'EMPLOYEE_DOCUMENT_DELETED'
  ],
  LEAVE: ['LEAVE_APPROVED', 'LEAVE_REJECTED'],
  PAYROLL: ['PAYROLL_PROCESSED', 'PAYROLL_APPROVED', 'PAYROLL_LOCKED']
};

export const AUDIT_PAGE_SIZE = 50;
