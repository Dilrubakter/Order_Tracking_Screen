import { Icon } from '@/components/icons/Icon';
import { Pill } from '@/components/ui/Card';
import type { TimelineStepModel } from '../model';
import styles from './DeliveryTimeline.module.css';

type StepInput = Omit<TimelineStepModel, 'note' | 'badge'> & Partial<Pick<TimelineStepModel, 'note' | 'badge'>>;

function StepMarker({ step }: { step: StepInput }) {
  switch (step.state) {
    case 'done':
      return (
        <span className={styles.markerDone} data-tone={step.tone}>
          <Icon name="check" size={14} strokeWidth={3} />
        </span>
      );
    case 'current':
      return (
        <span className={styles.markerCurrent} data-tone={step.tone}>
          <span className={styles.dot} />
        </span>
      );
    case 'warning':
      return (
        <span className={styles.markerWarning} data-tone="warning">
          <span className={styles.exclaim}>!</span>
        </span>
      );
    default:
      return <span className={styles.markerUpcoming} />;
  }
}

/** Vertical step list shared by the delivery timeline and the case-details sheet. */
export function DeliveryTimelineSteps({ steps }: { steps: StepInput[] }) {
  return (
    <ol className={styles.steps}>
      {steps.map((step) => (
        <li
          key={step.key}
          className={styles.step}
          data-state={step.state}
          aria-current={step.state === 'current' || step.state === 'warning' ? 'step' : undefined}
        >
          <div className={styles.rail}>
            <StepMarker step={step} />
            {step.connector !== 'none' && (
              <span className={styles.connector} data-kind={step.connector} data-tone={step.tone} />
            )}
          </div>
          <div className={styles.stepBody}>
            <div className={styles.stepHead}>
              <span className={styles.stepLabel}>
                {step.label}
                {step.state === 'done' && <span className="visually-hidden"> (completed)</span>}
                {step.state === 'upcoming' && <span className="visually-hidden"> (upcoming)</span>}
              </span>
              {step.badge && <Pill tone={step.tone}>{step.badge}</Pill>}
            </div>
            {step.detail && <p className={`${styles.stepDetail} tabular`}>{step.detail}</p>}
            {step.note && (
              <p className={styles.note} data-tone="warning">
                <Icon name="alert" size={16} aria-hidden="true" />
                <span>{step.note}</span>
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
