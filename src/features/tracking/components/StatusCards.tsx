import { Icon } from '@/components/icons/Icon';
import { Button } from '@/components/ui/Button';
import { Card, IconBadge } from '@/components/ui/Card';
import { SwitchRow } from '@/components/ui/Primitives';
import { DELAY_CREDIT } from '@/data/policies';
import { formatMoney } from '@/lib/format';
import type { Money, RefundRequest, SupportCase } from '@/types/order';
import styles from './StatusCards.module.css';

/** Calm entry point shown directly under a "Delivered" hero. */
export function NotReceivedPrompt({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className={styles.prompt} onClick={onClick}>
      <IconBadge>
        <Icon name="search" size={20} />
      </IconBadge>
      <span className={styles.text}>
        <span className={styles.title}>Didn’t receive your package?</span>
        <span className={styles.sub}>We’ll help you find it or make it right.</span>
      </span>
      <Icon name="chevron-right" size={20} strokeWidth={2} className={styles.chevron} aria-hidden="true" />
    </button>
  );
}

export function CaseOpenedCard({
  supportCase,
  onViewDetails,
}: {
  supportCase: SupportCase;
  onViewDetails: () => void;
}) {
  return (
    <Card tone="info" padding="md" role="status" aria-labelledby="case-title">
      <div className={styles.row}>
        <IconBadge tone="info" variant="solid">
          <Icon name="clipboard" size={20} strokeWidth={2} />
        </IconBadge>
        <div className={styles.text}>
          <h2 id="case-title" className={styles.title}>
            We’re on it – case #{supportCase.id} opened
          </h2>
          <p className={styles.body}>We’ll update you within 24 hours. You don’t need to do anything else right now.</p>
        </div>
      </div>
      <Button variant="secondary" size="sm" fullWidth onClick={onViewDetails}>
        View case details
      </Button>
    </Card>
  );
}

interface RefundConfirmedCardProps {
  refund: RefundRequest;
  total: Money;
  paymentMethod: string;
}

export function RefundConfirmedCard({ refund, total, paymentMethod }: RefundConfirmedCardProps) {
  const cancelled = refund.choice === 'cancel_and_refund';
  return (
    <Card tone="success" padding="md" role="status">
      <div className={styles.row}>
        <IconBadge tone="success" variant="solid">
          <Icon name="check-circle" size={20} strokeWidth={2} />
        </IconBadge>
        <div className={styles.text}>
          <h2 className={styles.title}>
            {cancelled ? 'Order cancelled — refund on its way' : `${formatMoney(DELAY_CREDIT)} credit added`}
          </h2>
          <p className={styles.body}>
            {cancelled
              ? `${formatMoney(total)} back to ${paymentMethod} within 3–5 working days · #${refund.id}`
              : 'Your order is still on its way. We’ll let you know as soon as it moves.'}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function NotifyCard({ enabled, onChange }: { enabled: boolean; onChange: (enabled: boolean) => void }) {
  return (
    <Card padding="md" className={styles.notify}>
      <SwitchRow
        checked={enabled}
        onChange={onChange}
        label="Notify me when it ships"
        description="Push notification and email"
        icon={
          <IconBadge>
            <Icon name="bell" size={20} />
          </IconBadge>
        }
      />
    </Card>
  );
}
