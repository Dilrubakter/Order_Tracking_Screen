import type { ReactNode, SVGProps } from 'react';

/**
 * House icon set, drawn on a 24px grid for this app (no third-party icon
 * library). Style rules: 1.75 stroke, round caps and joins, 2px corner radii,
 * and delivery-specific details — the parcel always carries a tape line, the
 * van has a raised cab — so the set reads as ours rather than a stock kit.
 */
const GLYPHS = {
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.2 12.4l2.7 2.7 5-5.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.2V12l3.2 2" />
    </>
  ),
  truck: (
    <>
      <path d="M2.8 6.5h10.4v9.5H2.8z" />
      <path d="M13.2 9.5h3.9c.5 0 1 .2 1.3.6l2.3 2.9v3h-7.5" />
      <circle cx="7" cy="17.4" r="1.8" />
      <circle cx="16.8" cy="17.4" r="1.8" />
    </>
  ),
  box: (
    <>
      <path d="M3.5 7.4 12 3l8.5 4.4v9.2L12 21l-8.5-4.4z" />
      <path d="M3.5 7.4 12 11.8l8.5-4.4M12 11.8V21" />
      <path d="m7.7 5.2 8.6 4.4" />
    </>
  ),
  'wifi-off': (
    <>
      <path d="M3 3l18 18" />
      <path d="M8.6 16.3a4.9 4.9 0 0 1 6.8 0" />
      <path d="M5.2 12.8a9.8 9.8 0 0 1 4.9-2.6M18.8 12.8a9.9 9.9 0 0 0-2.3-1.6" />
      <path d="M2 9.2a14.7 14.7 0 0 1 4.1-2.6M22 9.2a14.6 14.6 0 0 0-10.4-3.8" />
      <path d="M12 19.8h.01" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m15.6 15.6 4.9 4.9" />
    </>
  ),
  phone: (
    <path d="M5.2 3.8h3.3l1.8 4.6-2.2 1.4a11 11 0 0 0 6.1 6.1l1.4-2.2 4.6 1.8v3.3a1.8 1.8 0 0 1-2 1.8A16.4 16.4 0 0 1 3.4 5.8a1.8 1.8 0 0 1 1.8-2" />
  ),
  headset: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <path d="M4 14a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2zM20 14a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2z" />
      <path d="M17 18v.6A2.4 2.4 0 0 1 14.6 21H12" />
    </>
  ),
  chat: <path d="M4.5 4.8h15a1 1 0 0 1 1 1v9.4a1 1 0 0 1-1 1H10l-4.6 3.6v-3.6h-.9a1 1 0 0 1-1-1V5.8a1 1 0 0 1 1-1z" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M15 9V5.6A1.6 1.6 0 0 0 13.4 4H5.6A1.6 1.6 0 0 0 4 5.6v7.8A1.6 1.6 0 0 0 5.6 15H9" />
    </>
  ),
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  'chevron-down': <path d="m6 9.5 6 6 6-6" />,
  'chevron-right': <path d="m9.5 6 6 6-6 6" />,
  'chevron-left': <path d="m14.5 6-6 6 6 6" />,
  'arrow-right': <path d="M4.5 12h15M13.5 6l6 6-6 6" />,
  bell: (
    <>
      <path d="M6 16.2v-5a6 6 0 0 1 12 0v5l1.6 2.1H4.4z" />
      <path d="M10 20.6a2 2 0 0 0 4 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.2" r="3.2" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M15.8 5.2a3.1 3.1 0 0 1 0 6M17.8 14.6A6 6 0 0 1 21 20" />
    </>
  ),
  undo: <path d="M9 14.5 4.5 10 9 5.5M4.5 10h10a5 5 0 0 1 0 10h-3" />,
  bag: (
    <>
      <path d="M5 8h14l-1.1 11.3a1.8 1.8 0 0 1-1.8 1.7H7.9a1.8 1.8 0 0 1-1.8-1.7z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  send: <path d="M4.2 4.6 20 12 4.2 19.4 6.8 12zM6.8 12H13" />,
  reset: <path d="M4.6 9A8 8 0 1 1 4 13.5M4.2 4.5V9h4.5" />,
  refresh: <path d="M19.8 11A8 8 0 1 0 17.6 16.7M20 4.2V11h-6.8" />,
  pen: <path d="M4 20h4.2L19 9.2a2.1 2.1 0 0 0 0-3L17.8 5a2.1 2.1 0 0 0-3 0L4 15.8zM13.4 6.4l4.2 4.2" />,
  pin: (
    <>
      <path d="M12 21s-7-6.1-7-11.4a7 7 0 0 1 14 0C19 14.9 12 21 12 21z" />
      <circle cx="12" cy="9.6" r="2.5" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.6 6.6 8.4 6.2 8.4-6.2" />
    </>
  ),
  loader: (
    <path d="M12 3v3.2M12 17.8V21M3 12h3.2M17.8 12H21M5.6 5.6l2.3 2.3M16.1 16.1l2.3 2.3M5.6 18.4l2.3-2.3M16.1 7.9l2.3-2.3" />
  ),
  door: (
    <>
      <path d="M6 21V4.2A1.2 1.2 0 0 1 7.2 3h9.6A1.2 1.2 0 0 1 18 4.2V21" />
      <path d="M3.8 21h16.4M14.5 12.2h.01" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5.5" y="4.5" width="13" height="16.5" rx="2" />
      <path d="M9 3h6v3H9zM9 11h6M9 15h4" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.2" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4" />
    </>
  ),
  book: (
    <path d="M4 5.2A2.2 2.2 0 0 1 6.2 3H19v15.5H6.2A2.2 2.2 0 0 0 4 20.7zM4 20.7A2.2 2.2 0 0 0 6.2 21H19M8.5 7.5h6.5" />
  ),
  alert: <path d="M12 3.8 21.2 19.6H2.8zM12 10v4M12 16.9h.01" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof GLYPHS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

/** Decorative by default (`aria-hidden`); pair it with visible text or an `aria-label` on the control. */
export function Icon({ name, size = 20, strokeWidth = 1.75, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0 }}
      {...rest}
    >
      {GLYPHS[name]}
    </svg>
  );
}
