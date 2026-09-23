import { describe, expect, it } from 'vitest';

const nbsp = (s: string) => s.replace(/ (AM|PM)/g, '\u00a0$1');
import { formatDateTime, formatHourRange, formatMoney, formatTrackingNumber, formatWindow, isSameDay } from '../format';

describe('format', () => {
  it('formats a same-day delivery window with a compact hour range', () => {
    const window = { start: '2024-09-26T14:00:00+06:00', end: '2024-09-26T18:00:00+06:00' };
    expect(formatHourRange(window)).toBe(nbsp('2–6 PM'));
    expect(formatWindow(window)).toBe(nbsp('Thu, Sep 26 · 2–6 PM'));
  });

  it('keeps both periods when a window crosses noon', () => {
    expect(formatHourRange({ start: '2024-09-26T11:00:00+06:00', end: '2024-09-26T14:30:00+06:00' })).toBe(
      nbsp('11 AM–2:30 PM'),
    );
  });

  it('formats a multi-day window as a date range', () => {
    expect(formatWindow({ start: '2024-09-26T09:00:00+06:00', end: '2024-09-30T21:00:00+06:00' })).toBe(
      'Thu, Sep 26 – Mon, Sep 30',
    );
  });

  it('compares days in the display time zone, not UTC', () => {
    // 1 AM in Dhaka is still the previous day in UTC.
    expect(isSameDay('2024-09-26T01:10:00+06:00', '2024-09-26T08:00:00+06:00')).toBe(true);
    expect(isSameDay('2024-09-26T01:10:00+06:00', '2024-09-25T23:00:00+06:00')).toBe(false);
  });

  it('formats timestamps, money and tracking numbers', () => {
    expect(formatDateTime('2024-09-26T13:47:00+06:00')).toBe('Thu, Sep 26 · 1:47 PM');
    expect(formatMoney({ amount: 7970, currency: 'BDT' })).toBe('৳7,970');
    expect(formatMoney({ amount: 164500, currency: 'BDT' })).toBe('৳1,64,500');
    expect(formatMoney({ amount: 99.5, currency: 'BDT' })).toBe('৳99.50');
    expect(formatTrackingNumber('PDX739422105836')).toBe('PDX 7394 2210 5836');
  });
});
