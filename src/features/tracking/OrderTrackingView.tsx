import { useMemo, useState, type ReactNode } from 'react';
import { Icon } from '@/components/icons/Icon';
import { setShipNotifications } from '@/api/trackingApi';
import { ActionNote, Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { ScenarioId } from '@/data/scenarios';
import { HelpCard } from '@/features/support/HelpCard';
import type { Order } from '@/types/order';
import { CarrierInfo } from './components/CarrierInfo';
import { DeliveryTimeline } from './components/DeliveryTimeline';
import { OrderSummary } from './components/OrderSummary';
import { PhotoViewer } from './components/PhotoViewer';
import { CaseOpenedCard, NotifyCard, NotReceivedPrompt, RefundConfirmedCard } from './components/StatusCards';
import { DelayPanel, EtaPanel, HeroFootnote, ProofPanel, StatusHero } from './components/StatusHero';
import { buildHeroModel, buildTimeline } from './model';
import { CaseDetailsSheet } from './sheets/CaseDetailsSheet';
import { MissingPackageSheet } from './sheets/MissingPackageSheet';
import { RefundSheet } from './sheets/RefundSheet';

type Overlay = 'missing' | 'refund' | 'case' | 'photo' | null;

interface OrderTrackingViewProps {
  topBar: ReactNode;
  scenarioId: ScenarioId;
  order: Order;
  serverTime: string;
  onOrderChange: (order: Order) => void;
}

/**
 * One layout for every tracking state. The same blocks always render in the
 * same order; only the hero treatment, the contextual card under it and the
 * sticky actions change.
 */
export function OrderTrackingView({ topBar, scenarioId, order, serverTime, onOrderChange }: OrderTrackingViewProps) {
  const toast = useToast();
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [requestingUpdate, setRequestingUpdate] = useState(false);
  const close = () => setOverlay(null);

  const { tracking } = order;
  const hero = useMemo(() => buildHeroModel(order, serverTime), [order, serverTime]);
  const steps = useMemo(() => buildTimeline(order, serverTime), [order, serverTime]);
  const isDelivered = tracking.status === 'delivered';

  const heroPanel =
    isDelivered && tracking.proof ? (
      <ProofPanel proof={tracking.proof} onViewPhoto={() => setOverlay('photo')} />
    ) : tracking.delay ? (
      <DelayPanel delay={tracking.delay} eta={tracking.eta} />
    ) : tracking.eta ? (
      <EtaPanel eta={tracking.eta} serverTime={serverTime} />
    ) : null;

  const toggleNotifications = async (enabled: boolean) => {
    onOrderChange({ ...order, tracking: { ...tracking, notifyOnShip: enabled } }); // optimistic
    onOrderChange(await setShipNotifications(scenarioId, enabled));
    toast(enabled ? 'We’ll notify you when your order ships' : 'Shipping notifications turned off');
  };

  const requestUpdate = () => {
    setRequestingUpdate(true);
    window.setTimeout(() => {
      setRequestingUpdate(false);
      toast('Update requested — we’ll notify you as soon as the carrier responds');
    }, 700);
  };

  const showDelayActions = Boolean(tracking.delay && !tracking.refund);
  const actions = showDelayActions ? (
    <>
      <Button
        size="lg"
        fullWidth
        icon={<Icon name="bell" size={20} />}
        loading={requestingUpdate}
        onClick={requestUpdate}
      >
        Get delivery update
      </Button>
      {tracking.refundEligible && (
        <>
          <Button
            variant="secondary"
            fullWidth
            icon={<Icon name="undo" size={18} />}
            onClick={() => setOverlay('refund')}
          >
            Cancel or request refund
          </Button>
          <ActionNote>Eligible for a full refund while this order is delayed</ActionNote>
        </>
      )}
    </>
  ) : undefined;

  return (
    <Screen topBar={topBar} actions={actions}>
      <StatusHero model={hero} pill={tracking.missingReport ? { label: 'Case open' } : undefined}>
        {heroPanel}
        {tracking.delay && !tracking.refund && (
          <HeroFootnote>
            We’re sorry for the wait. We’re watching this shipment and will update you if anything changes.
          </HeroFootnote>
        )}
      </StatusHero>

      {isDelivered && !tracking.missingReport && <NotReceivedPrompt onClick={() => setOverlay('missing')} />}
      {tracking.missingReport && (
        <CaseOpenedCard supportCase={tracking.missingReport} onViewDetails={() => setOverlay('case')} />
      )}
      {tracking.refund && (
        <RefundConfirmedCard refund={tracking.refund} total={order.total} paymentMethod={order.paymentMethod} />
      )}
      {tracking.awaitingCarrier && <NotifyCard enabled={tracking.notifyOnShip} onChange={toggleNotifications} />}

      <DeliveryTimeline
        steps={steps}
        scans={tracking.scans}
        historyTone={hero.tone}
        emptyHistoryText="Carrier scan history appears after pickup"
      />
      <CarrierInfo carrier={order.carrier} />
      <OrderSummary order={order} />
      <HelpCard />

      {isDelivered && (
        <MissingPackageSheet
          open={overlay === 'missing'}
          scenarioId={scenarioId}
          onClose={close}
          onReported={onOrderChange}
        />
      )}
      {tracking.delay && (
        <RefundSheet
          open={overlay === 'refund'}
          order={order}
          scenarioId={scenarioId}
          onClose={close}
          onRequested={onOrderChange}
        />
      )}
      {tracking.missingReport && (
        <CaseDetailsSheet
          open={overlay === 'case'}
          supportCase={tracking.missingReport}
          order={order}
          onClose={close}
        />
      )}
      {tracking.proof && (
        <PhotoViewer
          open={overlay === 'photo'}
          proof={tracking.proof}
          carrierName={order.carrier?.name}
          onClose={close}
        />
      )}
    </Screen>
  );
}
