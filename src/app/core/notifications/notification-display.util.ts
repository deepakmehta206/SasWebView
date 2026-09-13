/** Shared date formatting for notification timestamps (UTC ISO from API). */
export function formatNotificationDateTime(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatChannelLabel(channel: string): string {
  switch (channel.toUpperCase()) {
    case 'IN_APP':
      return 'In-App';
    case 'EMAIL':
      return 'Email';
    case 'SMS':
      return 'SMS';
    case 'WHATSAPP':
      return 'WhatsApp';
    default:
      return channel;
  }
}

export function formatNotificationTypeLabel(type: string): string {
  switch (type.toUpperCase()) {
    case 'PASSWORD_RESET':
      return 'Password reset';
    case 'LEAVE_APPROVED':
      return 'Leave approved';
    case 'LEAVE_REJECTED':
      return 'Leave rejected';
    case 'PAYROLL_PROCESSED':
      return 'Payroll processed';
    default:
      return type;
  }
}
