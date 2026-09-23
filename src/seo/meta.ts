import { SCENARIOS, type ScenarioId } from '@/data/scenarios';

/** Public origin plus base path, without a trailing slash (set in vite.config.ts). */
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? '').replace(/\/$/, '');
const SITE_NAME = 'Order Tracking Demo';

export interface PageMeta {
  title: string;
  description: string;
  /** Path used for the canonical URL, e.g. `/track/delayed`. */
  path: string;
  /** Keep the page out of search results (unknown routes). */
  noindex?: boolean;
}

export const HOME_META: PageMeta = {
  title: 'Order Tracking UI Demo – 8 Delivery States in React',
  description:
    'Interactive mobile order tracking screen built with React and TypeScript: out for delivery, delayed, delivered, loading, error and empty states for one order.',
  path: '/',
};

// Longer than the one-line picker copy: these are what search results and link previews show.
const SCENARIO_DESCRIPTIONS: Record<ScenarioId, string> = {
  'out-for-delivery':
    'Order out for delivery: live status, delivery window, courier details and timeline in a mobile order tracking UI built with React.',
  'slow-network':
    'Loading state for order tracking on a slow connection: a skeleton screen that matches the real layout while tracking loads.',
  'network-error':
    'Error state for order tracking: the request fails, the screen explains what happened and Try again recovers without losing context.',
  'no-active-orders':
    'Empty state for order tracking when a customer has no active orders, with a clear path back to shopping and support.',
  delayed:
    'Delayed delivery with a new date: the original estimate struck through, a stalled timeline step and refund or cancel options.',
  'delayed-no-eta':
    'Delayed delivery while the carrier has not shared a new date yet, with honest copy and ways to get help or a refund.',
  delivered:
    'Delivered but not received: proof-of-delivery photo, guided checks and a missing package report in a mobile tracking flow.',
  'awaiting-carrier':
    'Order confirmed but not yet picked up by the carrier: what happens next and an option to be notified when it ships.',
};

export function scenarioMeta(id: ScenarioId): PageMeta {
  const scenario = SCENARIOS.find((s) => s.id === id)!;
  return {
    title: `${scenario.title} – ${SITE_NAME}`,
    description: SCENARIO_DESCRIPTIONS[id],
    path: `/track/${id}`,
  };
}

export const NOT_FOUND_META: PageMeta = {
  title: `Page not found – ${SITE_NAME}`,
  description: HOME_META.description,
  path: '/',
  noindex: true,
};

/** Every indexable page, used for pre-rendering and sitemap.xml. */
export const INDEXABLE_PAGES: PageMeta[] = [HOME_META, ...SCENARIOS.map((s) => scenarioMeta(s.id))];

/** `/track/delayed` → `https://…/track/delayed`. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}
