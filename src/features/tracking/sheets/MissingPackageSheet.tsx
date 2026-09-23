import { useState } from 'react';
import { Icon, type IconName } from '@/components/icons/Icon';
import { reportMissingPackage } from '@/api/trackingApi';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import type { ScenarioId } from '@/data/scenarios';
import type { Order } from '@/types/order';
import styles from './sheets.module.css';

const CHECKS = [
  {
    id: 'door',
    icon: 'door',
    title: 'Check around your door',
    detail: 'Porch, garage, side entrances or behind planters.',
  },
  {
    id: 'mailroom',
    icon: 'building',
    title: 'Check the mailroom or lockers',
    detail: 'Front desk, parcel locker or building reception.',
  },
  {
    id: 'people',
    icon: 'users',
    title: 'Ask neighbors and your household',
    detail: 'Someone may have taken it in for you.',
  },
  {
    id: 'wait',
    icon: 'clock',
    title: 'Give it until end of day',
    detail: 'Some carriers mark packages delivered up to 24 hours early.',
  },
] satisfies Array<{ id: string; icon: IconName; title: string; detail: string }>;

interface MissingPackageSheetProps {
  open: boolean;
  scenarioId: ScenarioId;
  onClose: () => void;
  onReported: (order: Order) => void;
}

/** Guided flow: quick self-checks first, then open a support case. */
export function MissingPackageSheet({ open, scenarioId, onClose, onReported }: MissingPackageSheetProps) {
  const toast = useToast();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const report = async () => {
    setSubmitting(true);
    try {
      const order = await reportMissingPackage(scenarioId);
      onReported(order);
      onClose();
      toast('Report sent — case #CS-10492 opened');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Let’s find your package"
      description="Most “missing” packages turn up within a day. Tick off a few quick checks:"
      footer={
        <>
          <Button size="lg" fullWidth loading={submitting} onClick={report}>
            Report missing package
          </Button>
          <Button
            variant="secondary"
            fullWidth
            disabled={submitting}
            onClick={() => {
              onClose();
              toast('Great — glad you found it!');
            }}
          >
            I found it
          </Button>
        </>
      }
    >
      <ul className={styles.checklist}>
        {CHECKS.map(({ id, icon, title, detail }) => (
          <li key={id}>
            <label className={styles.check}>
              <Icon name={icon} size={22} className={styles.checkIcon} />
              <span className={styles.checkText}>
                <span className={styles.checkTitle}>{title}</span>
                <span className={styles.checkDetail}>{detail}</span>
              </span>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={checked.has(id)}
                onChange={() => toggle(id)}
              />
            </label>
          </li>
        ))}
      </ul>
      <p className={styles.progress} aria-live="polite">
        {checked.size} of {CHECKS.length} checked
      </p>
    </Sheet>
  );
}
