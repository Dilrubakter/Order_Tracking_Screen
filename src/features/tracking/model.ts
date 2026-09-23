import { formatDateTime, formatDay, formatHourRange, formatTime, formatWindow, isSameDay } from '@/lib/format';
import { DELIVERY_STEPS, type DeliveryStatus, type Order } from '@/types/order';
import type { Tone } from '@/types/tone';

/**
 * Pure view-model builders: they turn an Order into exactly what the
 * tracking screen renders, so components stay presentational and the
 * status rules are unit-testable in one place.
 */

export type { Tone };
export type HeroIcon = 'truck' | 'check' | 'clock' | 'box';
export type SegmentTone = Tone | 'empty';

export const STEP_LABELS: Record<DeliveryStatus, string> = {
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

export interface HeroModel {
  tone: Tone;
  icon: HeroIcon;
  title: string;
  message: string;
  progressLabel: string;
  segments: SegmentTone[];
}

export function stepIndex(status: DeliveryStatus): number {
  return DELIVERY_STEPS.indexOf(status);
}

export function buildHeroModel(order: Order, serverTime: string): HeroModel {
  const { tracking } = order;
  const current = stepIndex(tracking.status);

  const segments = (currentTone: Tone, doneTone: Tone = 'info'): SegmentTone[] =>
    DELIVERY_STEPS.map((_, i) => (i < current ? doneTone : i === current ? currentTone : 'empty'));
  const progressLabel = `Step ${current + 1} of ${DELIVERY_STEPS.length}`;

  if (tracking.status === 'delivered') {
    const at = tracking.proof?.deliveredAt ?? tracking.stepTimes.delivered ?? serverTime;
    const when = isSameDay(at, serverTime) ? `today at ${formatTime(at)}` : `on ${formatDay(at)} at ${formatTime(at)}`;
    return {
      tone: 'success',
      icon: 'check',
      title: 'Delivered',
      message: `Your package was delivered ${when}.`,
      progressLabel: 'Complete',
      segments: DELIVERY_STEPS.map(() => 'success'),
    };
  }

  if (tracking.delay) {
    return {
      tone: 'warning',
      icon: 'clock',
      title: 'Your order is delayed',
      message: `It was expected by ${formatDay(tracking.delay.originalEta.start)}. ${tracking.delay.reason}`,
      progressLabel,
      segments: segments('warning'),
    };
  }

  if (tracking.awaitingCarrier) {
    return {
      tone: 'info',
      icon: 'box',
      title: 'Order confirmed – preparing for shipment',
      message: 'Tracking details will appear once the carrier picks up your package, usually within 1–2 working days.',
      progressLabel,
      segments: segments('info'),
    };
  }

  const copy: Record<Exclude<DeliveryStatus, 'delivered'>, Pick<HeroModel, 'icon' | 'title' | 'message'>> = {
    processing: {
      icon: 'box',
      title: 'Processing',
      message: 'We’re packing your items and preparing them for the carrier.',
    },
    shipped: { icon: 'truck', title: 'Shipped', message: 'Your package is on its way to your local delivery center.' },
    out_for_delivery: {
      icon: 'truck',
      title: 'Out for Delivery',
      message:
        tracking.eta && isSameDay(tracking.eta.start, serverTime)
          ? 'Your package is on the delivery vehicle and will arrive today.'
          : 'Your package is on the delivery vehicle.',
    },
  };
  return { tone: 'info', ...copy[tracking.status], progressLabel, segments: segments('info') };
}

export type StepState = 'done' | 'current' | 'warning' | 'upcoming';

export interface TimelineStepModel {
  key: string;
  label: string;
  state: StepState;
  tone: Tone;
  detail: string;
  badge?: string;
  note?: string;
  /** How the connector below this step is drawn. */
  connector: 'solid' | 'dashed' | 'muted' | 'none';
}

function upcomingDetail(step: DeliveryStatus, order: Order, serverTime: string): string {
  const { eta, awaitingCarrier } = order.tracking;
  if (step === 'shipped') return awaitingCarrier ? 'Waiting for carrier pickup' : 'Expected soon';
  if (!eta) return step === 'delivered' ? 'We’ll update this as soon as we know' : 'Date pending from carrier';
  const sameDay = isSameDay(eta.start, eta.end);
  if (step === 'out_for_delivery')
    return sameDay ? `Expected ${formatDay(eta.start)}` : `Expected ${formatWindow(eta)}`;
  if (!sameDay) return 'We’ll confirm the exact day once it ships';
  return isSameDay(eta.start, serverTime)
    ? `Expected today, ${formatHourRange(eta)}`
    : `Expected ${formatDay(eta.start)}, ${formatHourRange(eta)}`;
}

export function buildTimeline(order: Order, serverTime: string): TimelineStepModel[] {
  const { tracking } = order;
  const current = stepIndex(tracking.status);
  const isDelivered = tracking.status === 'delivered';
  const baseTone: Tone = isDelivered ? 'success' : 'info';

  const steps: TimelineStepModel[] = DELIVERY_STEPS.map((status, i) => {
    const time = tracking.stepTimes[status];
    const label = STEP_LABELS[status];

    if (i < current || (isDelivered && i === current)) {
      const suffix = status === 'delivered' && tracking.proof ? ` · ${tracking.proof.location}` : '';
      return {
        key: status,
        label,
        state: 'done',
        tone: baseTone,
        detail: `${formatDateTime(time!)}${suffix}`,
        connector: 'solid',
      };
    }

    if (i === current) {
      if (tracking.delay) {
        return {
          key: status,
          label,
          state: 'warning',
          tone: 'warning',
          badge: 'Delayed',
          detail: time ? formatDateTime(time) : '',
          note: `Delay in transit reported ${formatDay(tracking.delay.reportedAt)} · last scan ${tracking.delay.lastScanLocation}`,
          connector: 'dashed',
        };
      }
      const where = tracking.scans[0]?.location;
      const detail = tracking.awaitingCarrier
        ? `Order confirmed ${formatDateTime(time!)} · packing your items`
        : [formatDateTime(time!), where].filter(Boolean).join(' · ');
      return { key: status, label, state: 'current', tone: 'info', badge: 'Now', detail, connector: 'muted' };
    }

    return {
      key: status,
      label,
      state: 'upcoming',
      tone: 'neutral',
      detail: upcomingDetail(status, order, serverTime),
      connector: 'muted',
    };
  });

  const report = tracking.missingReport;
  if (report) {
    steps.push({
      key: 'reported',
      label: 'Reported not received',
      state: 'current',
      tone: 'info',
      badge: 'Case open',
      detail: `${formatDateTime(report.openedAt)} · Support is investigating with ${order.carrier?.name ?? 'the carrier'}`,
      connector: 'none',
    });
  } else {
    steps[steps.length - 1].connector = 'none';
  }
  return steps;
}
