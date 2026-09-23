import { getScenario, type ScenarioId } from '@/data/scenarios';
import type { Order, RefundChoice, RefundRequest, SupportCase } from '@/types/order';

/**
 * Mock tracking API. It behaves like a network client (latency, failures,
 * abort support) but reads and writes an in-memory store, so actions such
 * as "report missing package" persist while the app is open.
 */

export interface TrackingResponse {
  order: Order | null;
  serverTime: string;
}

export class TrackingApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'TrackingApiError';
  }
}

const store = new Map<ScenarioId, Order | null>();

function requireScenario(id: ScenarioId) {
  const scenario = getScenario(id);
  if (!scenario) throw new TrackingApiError(`Unknown scenario "${id}"`, 'NOT_FOUND');
  return scenario;
}

function readOrder(id: ScenarioId): Order | null {
  if (!store.has(id)) store.set(id, requireScenario(id).createOrder());
  return store.get(id) ?? null;
}

function writeOrder(id: ScenarioId, update: (order: Order) => Order): Order {
  const current = readOrder(id);
  if (!current) throw new TrackingApiError('No active order', 'NO_ORDER');
  const next = update(current);
  store.set(id, next);
  return next;
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

const clone = <T>(value: T): T => structuredClone(value);

export async function fetchTracking(
  scenarioId: ScenarioId,
  /** `retryCount` is 0 for the first load; the error demo only fails that one. */
  options: { signal?: AbortSignal; retryCount?: number } = {},
): Promise<TrackingResponse> {
  const scenario = requireScenario(scenarioId);

  await wait(scenario.latencyMs, options.signal);

  if (scenario.failFirstRequest && (options.retryCount ?? 0) === 0) {
    throw new TrackingApiError('Tracking service unreachable', 'NET-504');
  }
  return { order: clone(readOrder(scenarioId)), serverTime: scenario.serverTime };
}

export async function reportMissingPackage(scenarioId: ScenarioId): Promise<Order> {
  const scenario = requireScenario(scenarioId);
  await wait(800);
  const openedAt = scenario.serverTime;
  const nextUpdateBy = new Date(new Date(openedAt).getTime() + 24 * 3_600_000).toISOString();
  const report: SupportCase = { id: 'CS-10492', openedAt, status: 'investigating', nextUpdateBy };
  return clone(
    writeOrder(scenarioId, (order) => ({
      ...order,
      tracking: { ...order.tracking, missingReport: report },
    })),
  );
}

export async function requestRefund(scenarioId: ScenarioId, choice: RefundChoice): Promise<Order> {
  const scenario = requireScenario(scenarioId);
  await wait(800);
  const refund: RefundRequest = { id: 'RF-20931', choice, requestedAt: scenario.serverTime };
  return clone(
    writeOrder(scenarioId, (order) => ({
      ...order,
      tracking: { ...order.tracking, refund, refundEligible: false },
    })),
  );
}

export async function setShipNotifications(scenarioId: ScenarioId, enabled: boolean): Promise<Order> {
  await wait(250);
  return clone(
    writeOrder(scenarioId, (order) => ({
      ...order,
      tracking: { ...order.tracking, notifyOnShip: enabled },
    })),
  );
}

/** Restores every scenario to its fixture (used by the demo picker). */
export function resetMockApi(): void {
  store.clear();
}
