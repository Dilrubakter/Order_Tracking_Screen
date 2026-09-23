import { useParams } from 'react-router-dom';
import { Icon } from '@/components/icons/Icon';
import { Screen, TopBar } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { DEMO_ORDER_ID } from '@/data/mockOrders';
import { getScenario, type ScenarioId } from '@/data/scenarios';
import { HelpCard } from '@/features/support/HelpCard';
import { SupportProvider, useSupport } from '@/features/support/SupportContext';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { NOT_FOUND_META, scenarioMeta } from '@/seo/meta';
import { useDocumentMeta } from '@/seo/useDocumentMeta';
import { OrderTrackingView } from './OrderTrackingView';
import { NoActiveOrders, NotFoundCard, TrackingErrorCard, TrackingSkeleton } from './states/TrackingStates';

/** Route: /track/:scenarioId */
export function TrackOrderPage() {
  const { scenarioId } = useParams();
  const scenario = getScenario(scenarioId);
  useDocumentMeta(scenario ? scenarioMeta(scenario.id) : NOT_FOUND_META);

  if (!scenario) {
    return (
      <Screen topBar={<TopBar title="Track Order" backTo="/" />}>
        <NotFoundCard />
      </Screen>
    );
  }

  const hasOrder = scenario.id !== 'no-active-orders';
  return (
    // `key` resets all local UI state when switching scenarios.
    <SupportProvider key={scenario.id} orderId={hasOrder ? DEMO_ORDER_ID : undefined}>
      <TrackOrderScreen scenarioId={scenario.id} hasOrder={hasOrder} />
    </SupportProvider>
  );
}

function TrackOrderScreen({ scenarioId, hasOrder }: { scenarioId: ScenarioId; hasOrder: boolean }) {
  const { state, retry, replaceOrder } = useOrderTracking(scenarioId);
  const support = useSupport();

  const topBar = (
    <TopBar
      title="Track Order"
      subtitle={hasOrder ? `Order #${DEMO_ORDER_ID}` : undefined}
      backTo="/"
      onHelp={() => support.open('menu')}
    />
  );

  switch (state.status) {
    case 'loading':
      return (
        <Screen topBar={topBar} busy>
          <TrackingSkeleton />
          <HelpCard />
        </Screen>
      );

    case 'error':
      return (
        <Screen
          topBar={topBar}
          actions={
            <Button size="lg" fullWidth icon={<Icon name="refresh" size={20} strokeWidth={2} />} onClick={retry}>
              Try again
            </Button>
          }
        >
          <TrackingErrorCard errorCode={state.errorCode} failedAt={state.failedAt} />
          <HelpCard />
        </Screen>
      );

    case 'empty':
      return (
        <Screen topBar={topBar}>
          <NoActiveOrders />
          <HelpCard
            title="Need help with an order?"
            description="Questions about returns or a past order? We reply in about 2 minutes."
          />
        </Screen>
      );

    case 'ready':
      return (
        <OrderTrackingView
          topBar={topBar}
          scenarioId={scenarioId}
          order={state.order}
          serverTime={state.serverTime}
          onOrderChange={replaceOrder}
        />
      );
  }
}
