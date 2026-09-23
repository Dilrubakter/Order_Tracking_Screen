import { useId, useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { Card, CardTitle } from '@/components/ui/Card';
import { formatDateTime, pluralize } from '@/lib/format';
import type { ScanEvent } from '@/types/order';
import type { Tone } from '@/types/tone';
import type { TimelineStepModel } from '../model';
import { DeliveryTimelineSteps } from './TimelineSteps';
import styles from './DeliveryTimeline.module.css';

interface DeliveryTimelineProps {
  steps: TimelineStepModel[];
  scans: ScanEvent[];
  /** Colour for the newest scan dot in the history list. */
  historyTone?: Tone;
  /** Shown instead of the history toggle when there are no scans yet. */
  emptyHistoryText?: string;
}

export function DeliveryTimeline({ steps, scans, historyTone = 'info', emptyHistoryText }: DeliveryTimelineProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const titleId = useId();
  const historyId = useId();

  return (
    <Card aria-labelledby={titleId} className={styles.card}>
      <CardTitle id={titleId}>Delivery progress</CardTitle>
      <DeliveryTimelineSteps steps={steps} />

      <div className={styles.historySection}>
        {scans.length === 0 ? (
          <p className={styles.historyEmpty}>
            <Icon name="clock" size={18} aria-hidden="true" />
            {emptyHistoryText ?? 'No carrier scans yet'}
          </p>
        ) : (
          <>
            <button
              type="button"
              className={styles.historyToggle}
              aria-expanded={historyOpen}
              aria-controls={historyId}
              onClick={() => setHistoryOpen((open) => !open)}
            >
              <span className={styles.historyLabel}>
                {historyOpen ? 'Hide detailed tracking history' : 'View detailed tracking history'}
                <span className="visually-hidden"> ({pluralize(scans.length, 'scan')})</span>
              </span>
              <Icon name="chevron-down" size={20} strokeWidth={2} className={styles.chevron} data-open={historyOpen} />
            </button>
            {historyOpen && (
              <ol id={historyId} className={styles.history} aria-label="Carrier scan events">
                {scans.map((scan, i) => (
                  <li key={scan.id} className={styles.scan}>
                    <span className={styles.scanDot} data-tone={i === 0 ? historyTone : undefined} />
                    <div>
                      <p className={styles.scanTitle}>{scan.description}</p>
                      <p className={`${styles.scanMeta} tabular`}>
                        {[formatDateTime(scan.timestamp), scan.location].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
