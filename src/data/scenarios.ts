import type { Order } from '@/types/order';
import { awaitingCarrierOrder, deliveredOrder, delayedOrder, outForDeliveryOrder } from './mockOrders';

export type ScenarioId =
  | 'out-for-delivery'
  | 'slow-network'
  | 'network-error'
  | 'no-active-orders'
  | 'delayed'
  | 'delayed-no-eta'
  | 'delivered'
  | 'awaiting-carrier';

export type ScenarioTone = 'info' | 'neutral' | 'danger' | 'warning' | 'success';

export interface Scenario {
  id: ScenarioId;
  group: 'Core states' | 'Edge cases';
  title: string;
  description: string;
  tone: ScenarioTone;
  /** Simulated server clock, so "today" and relative copy stay stable. */
  serverTime: string;
  /** Simulated network latency for the tracking request. */
  latencyMs: number;
  /** The first request fails; a retry succeeds. */
  failFirstRequest?: boolean;
  /** `null` means the customer has no active order. */
  createOrder: () => Order | null;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'out-for-delivery',
    group: 'Core states',
    title: 'Out for Delivery',
    description: 'The happy path — baseline layout',
    tone: 'info',
    serverTime: '2024-09-26T10:30:00+06:00',
    latencyMs: 700,
    createOrder: outForDeliveryOrder,
  },
  {
    id: 'slow-network',
    group: 'Core states',
    title: 'Loading',
    description: 'Slow connection — skeleton for ~3 seconds',
    tone: 'neutral',
    serverTime: '2024-09-26T10:30:00+06:00',
    latencyMs: 3000,
    createOrder: outForDeliveryOrder,
  },
  {
    id: 'network-error',
    group: 'Core states',
    title: 'Couldn’t load tracking',
    description: 'First request fails — Try again recovers',
    tone: 'danger',
    serverTime: '2024-09-26T10:30:00+06:00',
    latencyMs: 900,
    failFirstRequest: true,
    createOrder: outForDeliveryOrder,
  },
  {
    id: 'no-active-orders',
    group: 'Core states',
    title: 'No active orders',
    description: 'Empty state with Continue shopping',
    tone: 'neutral',
    serverTime: '2024-09-26T10:30:00+06:00',
    latencyMs: 600,
    createOrder: () => null,
  },
  {
    id: 'delayed',
    group: 'Edge cases',
    title: 'Delayed — new date known',
    description: 'Original date struck through, refund option',
    tone: 'warning',
    serverTime: '2024-09-24T10:30:00+06:00',
    latencyMs: 700,
    createOrder: () => delayedOrder({ newEtaKnown: true }),
  },
  {
    id: 'delayed-no-eta',
    group: 'Edge cases',
    title: 'Delayed — estimate pending',
    description: 'Carrier hasn’t shared a new date yet',
    tone: 'warning',
    serverTime: '2024-09-24T10:30:00+06:00',
    latencyMs: 700,
    createOrder: () => delayedOrder({ newEtaKnown: false }),
  },
  {
    id: 'delivered',
    group: 'Edge cases',
    title: 'Delivered, not received',
    description: 'Proof of delivery → guided checks → report',
    tone: 'success',
    serverTime: '2024-09-26T19:20:00+06:00',
    latencyMs: 700,
    createOrder: deliveredOrder,
  },
  {
    id: 'awaiting-carrier',
    group: 'Edge cases',
    title: 'Tracking not available yet',
    description: 'Order confirmed, waiting for carrier pickup',
    tone: 'info',
    serverTime: '2024-09-23T14:00:00+06:00',
    latencyMs: 700,
    createOrder: awaitingCarrierOrder,
  },
];

export function getScenario(id: string | undefined): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
