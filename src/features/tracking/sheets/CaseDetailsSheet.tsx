import { Icon } from '@/components/icons/Icon';
import { Button, IconButton } from '@/components/ui/Button';
import { Pill } from '@/components/ui/Card';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import { useSupport } from '@/features/support/SupportContext';
import { formatDateTime, formatMoney } from '@/lib/format';
import type { Order, SupportCase } from '@/types/order';
import { DeliveryTimelineSteps } from '../components/TimelineSteps';
import styles from './sheets.module.css';

interface CaseDetailsSheetProps {
  open: boolean;
  supportCase: SupportCase;
  order: Order;
  onClose: () => void;
}

export function CaseDetailsSheet({ open, supportCase, order, onClose }: CaseDetailsSheetProps) {
  const toast = useToast();
  const support = useSupport();

  const copyCaseNumber = async () => {
    try {
      await navigator.clipboard?.writeText(supportCase.id);
    } catch {
      /* ignore */
    }
    toast(`Case number ${supportCase.id} copied`);
  };

  const opened = new Date(supportCase.openedAt).getTime();
  const steps = [
    { key: 'opened', label: 'Case opened', detail: formatDateTime(supportCase.openedAt), state: 'done' as const },
    {
      key: 'carrier',
      label: 'Carrier investigation requested',
      detail: `${formatDateTime(new Date(opened + 60_000).toISOString())} · ${order.carrier?.name ?? 'Carrier'}`,
      state: 'done' as const,
    },
    {
      key: 'update',
      label: 'Update from our team',
      detail: `By ${formatDateTime(supportCase.nextUpdateBy)}`,
      state: 'current' as const,
      badge: 'Next',
    },
    {
      key: 'resolve',
      label: 'Resolution',
      detail: `Replacement or full refund of ${formatMoney(order.total)}`,
      state: 'upcoming' as const,
    },
  ];

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Case details"
      footer={
        <>
          <Button
            size="lg"
            fullWidth
            icon={<Icon name="chat" size={20} />}
            onClick={() => {
              onClose();
              support.open('chat');
            }}
          >
            Chat about this case
          </Button>
          <Button variant="secondary" fullWidth onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      <div className={styles.caseMeta}>
        <Pill tone="info">Investigating</Pill>
        <span className={`${styles.checkDetail} tabular`}>Case #{supportCase.id}</span>
        <IconButton label="Copy case number" onClick={copyCaseNumber} className={styles.caseCopy}>
          <Icon name="copy" size={18} />
        </IconButton>
      </div>
      <DeliveryTimelineSteps
        steps={steps.map((s) => ({
          ...s,
          tone: 'info',
          connector: s.key === 'resolve' ? 'none' : s.state === 'done' ? 'solid' : 'muted',
        }))}
      />
    </Sheet>
  );
}
