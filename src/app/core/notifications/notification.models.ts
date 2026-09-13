/** Mirrors SaaSPlatform.Application DTOs for Phase 7 notifications. */

export const NotificationChannels = {
  InApp: 'IN_APP',
  Email: 'EMAIL',
  Sms: 'SMS',
  WhatsApp: 'WHATSAPP'
} as const;

export type NotificationChannel =
  (typeof NotificationChannels)[keyof typeof NotificationChannels];

export const NotificationTypes = {
  PasswordReset: 'PASSWORD_RESET',
  LeaveApproved: 'LEAVE_APPROVED',
  LeaveRejected: 'LEAVE_REJECTED',
  PayrollProcessed: 'PAYROLL_PROCESSED'
} as const;

export type NotificationType = (typeof NotificationTypes)[keyof typeof NotificationTypes];

export interface NotificationListItemDto {
  notificationId: number;
  notificationType: string;
  title: string;
  message: string;
  isRead: boolean;
  readDate: string | null;
  createdDate: string;
}

export interface NotificationDto {
  notificationId: number;
  tenantId: number;
  userId: number;
  notificationType: string;
  title: string;
  message: string;
  dataJson: string | null;
  sourceType: string | null;
  sourceId: string | null;
  isRead: boolean;
  readDate: string | null;
  createdDate: string;
}

export interface NotificationUnreadCountDto {
  unreadCount: number;
}

export interface NotificationPreferenceDto {
  preferenceId: number;
  notificationType: string;
  channel: string;
  isEnabled: boolean;
  isMandatory: boolean;
}

export interface UpsertNotificationPreferenceItem {
  notificationType: string;
  channel: string;
  isEnabled: boolean;
}

export interface UpsertNotificationPreferencesRequest {
  preferences: UpsertNotificationPreferenceItem[];
}

export interface NotificationTemplateDto {
  templateId: number;
  tenantId: number | null;
  templateCode: string;
  channel: string;
  language: string;
  subject: string | null;
  body: string;
  providerTemplateName: string | null;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string | null;
}

export interface CreateNotificationTemplateRequest {
  templateCode: string;
  channel: string;
  language: string;
  subject: string | null;
  body: string;
  providerTemplateName: string | null;
  isSystemTemplate: boolean;
}

export interface UpdateNotificationTemplateRequest {
  templateCode: string;
  channel: string;
  language: string;
  subject: string | null;
  body: string;
  providerTemplateName: string | null;
  isActive: boolean;
}

export interface SetNotificationTemplateStatusRequest {
  isActive: boolean;
}

export interface NotificationListQuery {
  isRead?: boolean;
  skip?: number;
  take?: number;
}

export interface NotificationTemplateListQuery {
  channel?: string;
  isActive?: boolean;
}
