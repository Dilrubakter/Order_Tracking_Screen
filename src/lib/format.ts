import type { Money, ShippingAddress, TimeWindow } from '@/types/order';

/** All delivery times are shown in the delivery address's time zone. */
export const DISPLAY_TIME_ZONE = 'Asia/Dhaka';
const LOCALE = 'en-US';

const dayFormatter = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: DISPLAY_TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: DISPLAY_TIME_ZONE,
});

const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: DISPLAY_TIME_ZONE,
});

/** "Thu, Sep 26" */
export function formatDay(iso: string): string {
  return dayFormatter.format(new Date(iso));
}

/** "1:47 PM" */
export function formatTime(iso: string): string {
  // Some ICU versions separate "PM" with a narrow no-break space; normalise it.
  return timeFormatter.format(new Date(iso)).replace(/ /g, ' ');
}

/** "Thu, Sep 26 · 1:47 PM" */
export function formatDateTime(iso: string): string {
  return `${formatDay(iso)} · ${formatTime(iso)}`;
}

export function isSameDay(a: string, b: string): boolean {
  return dateKeyFormatter.format(new Date(a)) === dateKeyFormatter.format(new Date(b));
}

function hourParts(iso: string) {
  const parts = timeFormatter.formatToParts(new Date(iso));
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';
  const period = parts.find((p) => p.type === 'dayPeriod')?.value ?? '';
  return { clock: minute === '00' ? hour : `${hour}:${minute}`, period };
}

const NBSP = '\u00a0';

/** "2–6 PM", or "11 AM–2 PM" when the window crosses noon. Non-breaking so it never wraps mid-range. */
export function formatHourRange(window: TimeWindow): string {
  const start = hourParts(window.start);
  const end = hourParts(window.end);
  return start.period === end.period
    ? `${start.clock}–${end.clock}${NBSP}${end.period}`
    : `${start.clock}${NBSP}${start.period}–${end.clock}${NBSP}${end.period}`;
}

/** "Thu, Sep 26 · 2–6 PM" for a same-day window, else "Thu, Sep 26 – Mon, Sep 30". */
export function formatWindow(window: TimeWindow): string {
  return isSameDay(window.start, window.end)
    ? `${formatDay(window.start)} · ${formatHourRange(window)}`
    : `${formatDay(window.start)} – ${formatDay(window.end)}`;
}

/** "৳7,970" — taka with South Asian digit grouping (৳1,64,500); paisa only when present. */
export function formatMoney({ amount, currency }: Money): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** "PDX739422105836" → "PDX 7394 2210 5836" */
export function formatTrackingNumber(raw: string): string {
  const match = raw.match(/^([A-Z]+)(\d+)$/);
  if (!match) return raw;
  const [, prefix, digits] = match;
  return [prefix, ...(digits.match(/.{1,4}/g) ?? [])].join(' ');
}

export function formatAddressOneLine(a: ShippingAddress): string {
  return [a.name, a.line1, a.line2, a.area, `${a.city} ${a.postalCode}`].filter(Boolean).join(', ');
}

export function formatAddressLines(a: ShippingAddress): string[] {
  return [
    a.name,
    [a.line1, a.line2].filter(Boolean).join(', '),
    `${a.area}, ${a.city} ${a.postalCode}, ${a.country}`,
    a.phone,
  ];
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
