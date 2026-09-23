import { useCallback, useEffect, useState } from 'react';
import { fetchTracking, TrackingApiError } from '@/api/trackingApi';
import type { ScenarioId } from '@/data/scenarios';
import type { Order } from '@/types/order';

export type TrackingState =
  | { status: 'loading' }
  | { status: 'error'; errorCode: string; failedAt: string }
  | { status: 'empty'; serverTime: string }
  | { status: 'ready'; order: Order; serverTime: string };

/**
 * Loads tracking for one order and exposes `retry` plus `replaceOrder`
 * (so mutations returned by the API update the screen without a refetch).
 */
export function useOrderTracking(scenarioId: ScenarioId) {
  const [state, setState] = useState<TrackingState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });

    fetchTracking(scenarioId, { signal: controller.signal, retryCount: attempt })
      .then(({ order, serverTime }) => {
        setState(order ? { status: 'ready', order, serverTime } : { status: 'empty', serverTime });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: 'error',
          errorCode: error instanceof TrackingApiError ? error.code : 'UNKNOWN',
          failedAt: new Date().toISOString(),
        });
      });

    return () => controller.abort();
  }, [scenarioId, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const replaceOrder = useCallback((order: Order) => {
    setState((prev) => (prev.status === 'ready' ? { ...prev, order } : prev));
  }, []);

  return { state, retry, replaceOrder };
}
