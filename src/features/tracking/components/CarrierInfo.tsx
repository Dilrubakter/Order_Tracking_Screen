import { Icon } from '@/components/icons/Icon';
import { IconButton } from '@/components/ui/Button';
import { Card, IconBadge } from '@/components/ui/Card';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { formatTrackingNumber } from '@/lib/format';
import type { Carrier } from '@/types/order';
import styles from './CarrierInfo.module.css';

export function CarrierInfo({ carrier }: { carrier: Carrier | null }) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <Card padding="row" aria-label="Carrier">
      <IconBadge>
        <Icon name="truck" size={20} />
      </IconBadge>
      <div className={styles.body}>
        {carrier ? (
          <>
            <p className={styles.meta}>
              {carrier.name} · Tracking no.
              {copied && (
                <span className={styles.copied} role="status">
                  {' '}
                  · Copied
                </span>
              )}
            </p>
            <p className={`${styles.number} tabular`}>{formatTrackingNumber(carrier.trackingNumber)}</p>
          </>
        ) : (
          <>
            <p className={styles.meta}>Carrier assigned at pickup</p>
            <p className={styles.pending}>Tracking number not available yet</p>
          </>
        )}
      </div>
      <IconButton
        bordered
        label={carrier ? 'Copy tracking number' : 'Copy tracking number (not available yet)'}
        disabled={!carrier}
        onClick={() => carrier && copy(carrier.trackingNumber)}
      >
        {copied ? (
          <Icon name="check" size={18} strokeWidth={2.5} className={styles.check} />
        ) : (
          <Icon name="copy" size={18} />
        )}
      </IconButton>
    </Card>
  );
}
