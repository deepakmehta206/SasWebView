import {
  formatChannelLabel,
  formatNotificationDateTime,
  formatNotificationTypeLabel
} from './notification-display.util';

describe('notification-display.util', () => {
  it('formats known channels', () => {
    expect(formatChannelLabel('IN_APP')).toBe('In-App');
    expect(formatChannelLabel('WHATSAPP')).toBe('WhatsApp');
  });

  it('formats known notification types', () => {
    expect(formatNotificationTypeLabel('PASSWORD_RESET')).toBe('Password reset');
    expect(formatNotificationTypeLabel('LEAVE_APPROVED')).toBe('Leave approved');
  });

  it('returns em dash for invalid dates', () => {
    expect(formatNotificationDateTime(null)).toBe('—');
    expect(formatNotificationDateTime('not-a-date')).toBe('—');
  });
});
