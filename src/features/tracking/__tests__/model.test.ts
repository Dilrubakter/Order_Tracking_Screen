import { describe, expect, it } from 'vitest';
import { awaitingCarrierOrder, delayedOrder, deliveredOrder, outForDeliveryOrder } from '@/data/mockOrders';
import { buildHeroModel, buildTimeline } from '../model';

const THU_MORNING = '2024-09-26T10:30:00+06:00';

describe('buildHeroModel', () => {
  it('uses the blue in-progress treatment for out-for-delivery', () => {
    const hero = buildHeroModel(outForDeliveryOrder(), THU_MORNING);
    expect(hero).toMatchObject({ tone: 'info', title: 'Out for Delivery', progressLabel: 'Step 3 of 4' });
    expect(hero.message).toMatch(/arrive today/);
    expect(hero.segments).toEqual(['info', 'info', 'info', 'empty']);
  });

  it('uses amber (not red) for a delay and names the original date', () => {
    const hero = buildHeroModel(delayedOrder({ newEtaKnown: true }), '2024-09-24T10:30:00+06:00');
    expect(hero.tone).toBe('warning');
    expect(hero.title).toBe('Your order is delayed');
    expect(hero.message).toBe('It was expected by Mon, Sep 23. The carrier reported a delay in transit.');
  });

  it('marks delivered orders complete and green', () => {
    const hero = buildHeroModel(deliveredOrder(), '2024-09-26T19:00:00+06:00');
    expect(hero).toMatchObject({ tone: 'success', progressLabel: 'Complete' });
    expect(hero.message).toBe('Your package was delivered today at 1:47 PM.');
  });

  it('explains when tracking is not available yet', () => {
    const hero = buildHeroModel(awaitingCarrierOrder(), '2024-09-23T14:00:00+06:00');
    expect(hero.title).toBe('Order confirmed – preparing for shipment');
    expect(hero.progressLabel).toBe('Step 1 of 4');
  });
});

describe('buildTimeline', () => {
  it('always shows the four delivery steps with completed timestamps', () => {
    const steps = buildTimeline(outForDeliveryOrder(), THU_MORNING);
    expect(steps.map((s) => [s.label, s.state])).toEqual([
      ['Processing', 'done'],
      ['Shipped', 'done'],
      ['Out for Delivery', 'current'],
      ['Delivered', 'upcoming'],
    ]);
    expect(steps[0].detail).toBe('Mon, Sep 23 · 9:41 AM');
    expect(steps[3].detail).toBe('Expected today, 2–6\u00a0PM');
  });

  it('flags the stalled step with a warning marker and a dashed connector', () => {
    const steps = buildTimeline(delayedOrder({ newEtaKnown: false }), '2024-09-24T10:30:00+06:00');
    expect(steps[1]).toMatchObject({ state: 'warning', badge: 'Delayed', connector: 'dashed' });
    expect(steps[1].note).toContain('Cumilla Sort Hub');
    expect(steps[3].detail).toBe('We’ll update this as soon as we know');
  });

  it('adds a "Reported not received" step once a case is opened', () => {
    const order = deliveredOrder();
    order.tracking.missingReport = {
      id: 'CS-10492',
      openedAt: '2024-09-26T19:30:00+06:00',
      status: 'investigating',
      nextUpdateBy: '2024-09-27T19:30:00+06:00',
    };
    const steps = buildTimeline(order, '2024-09-26T19:30:00+06:00');
    expect(steps).toHaveLength(5);
    expect(steps[3]).toMatchObject({ label: 'Delivered', state: 'done', connector: 'solid' });
    expect(steps[4]).toMatchObject({ label: 'Reported not received', state: 'current', badge: 'Case open' });
  });

  it('keeps future steps visible while waiting for the carrier', () => {
    const steps = buildTimeline(awaitingCarrierOrder(), '2024-09-23T14:00:00+06:00');
    expect(steps.map((s) => s.state)).toEqual(['current', 'upcoming', 'upcoming', 'upcoming']);
    expect(steps[1].detail).toBe('Waiting for carrier pickup');
  });
});
