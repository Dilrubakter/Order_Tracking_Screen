import { useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { requestRefund } from '@/api/trackingApi';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { DELAY_CREDIT } from '@/data/policies';
import type { ScenarioId } from '@/data/scenarios';
import { formatMoney } from '@/lib/format';
import type { Order, RefundChoice } from '@/types/order';
import styles from './sheets.module.css';

interface RefundSheetProps {
  open: boolean;
  order: Order;
  scenarioId: ScenarioId;
  onClose: () => void;
  onRequested: (order: Order) => void;
}

export function RefundSheet({ open, order, scenarioId, onClose, onRequested }: RefundSheetProps) {
  const [choice, setChoice] = useState<RefundChoice>('cancel_and_refund');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Order | null>(null);
  const total = formatMoney(order.total);

  const close = () => {
    if (result) onRequested(result);
    setResult(null);
    onClose();
  };

  const confirm = async () => {
    setSubmitting(true);
    try {
      setResult(await requestRefund(scenarioId, choice));
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const refund = result.tracking.refund!;
    return (
      <Sheet
        open={open}
        onClose={close}
        title="Request received"
        footer={
          <Button size="lg" fullWidth onClick={close}>
            Done
          </Button>
        }
      >
        <div className={styles.success} role="status">
          <span className={styles.successIcon} aria-hidden="true">
            <Icon name="check" size={28} strokeWidth={2.5} />
          </span>
          {refund.choice === 'cancel_and_refund' ? (
            <p>
              Your order is cancelled. <strong>{total}</strong> is on its way back to {order.paymentMethod} within 3–5
              working days. Reference #{refund.id}.
            </p>
          ) : (
            <p>
              A <strong>{formatMoney(DELAY_CREDIT)} credit</strong> has been added to your account. Your order is still
              on its way — we’ll keep you posted.
            </p>
          )}
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Cancel or request a refund"
      description="Because your order is delayed, you can choose either option. No return needed."
      footer={
        <>
          <Button size="lg" fullWidth loading={submitting} onClick={confirm}>
            Confirm
          </Button>
          <Button variant="secondary" fullWidth disabled={submitting} onClick={close}>
            Keep waiting
          </Button>
        </>
      }
    >
      <fieldset className={styles.fieldset}>
        <legend className="visually-hidden">Choose an option</legend>
        <RadioCard
          checked={choice === 'cancel_and_refund'}
          onSelect={() => setChoice('cancel_and_refund')}
          title="Cancel and get a full refund"
          detail={`${total} back to ${order.paymentMethod} in 3–5 working days. If the package still arrives, keep it or return it free.`}
        />
        <RadioCard
          checked={choice === 'keep_with_credit'}
          onSelect={() => setChoice('keep_with_credit')}
          title={`Keep my order + ${formatMoney(DELAY_CREDIT)} credit`}
          detail={`Your order stays on its way. We’ll add ${formatMoney(DELAY_CREDIT)} to your account for the delay.`}
        />
      </fieldset>
    </Sheet>
  );
}

function RadioCard({
  checked,
  onSelect,
  title,
  detail,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  detail: string;
}) {
  return (
    <label className={styles.radioCard} data-checked={checked}>
      <input type="radio" name="refund-choice" className={styles.radio} checked={checked} onChange={onSelect} />
      <span className={styles.checkText}>
        <span className={styles.checkTitle}>{title}</span>
        <span className={styles.checkDetail}>{detail}</span>
      </span>
    </label>
  );
}
