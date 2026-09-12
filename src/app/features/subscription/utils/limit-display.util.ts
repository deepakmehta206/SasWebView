/** Backend null limit means unlimited. */
export function formatLimit(value: number | null | undefined): string {
  return value == null ? 'Unlimited' : String(value);
}

export function formatStorageMb(value: number | null | undefined): string {
  if (value == null) {
    return 'Unlimited';
  }
  return `${value} MB`;
}

export function formatMoney(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode || 'INR'
    }).format(amount);
  } catch {
    return `${currencyCode || ''} ${amount.toFixed(2)}`.trim();
  }
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
