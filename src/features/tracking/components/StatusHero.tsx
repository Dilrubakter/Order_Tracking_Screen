import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/components/icons/Icon';
import { Card, IconBadge, Pill } from '@/components/ui/Card';
import { formatDateTime, formatDay, formatWindow, isSameDay } from '@/lib/format';
import type { DelayInfo, ProofOfDelivery, TimeWindow } from '@/types/order';
import type { HeroIcon, HeroModel } from '../model';
import { DeliveryPhoto } from './DeliveryPhoto';
import styles from './StatusHero.module.css';

const ICONS: Record<HeroIcon, IconName> = { truck: 'truck', check: 'check', clock: 'clock', box: 'box' };

interface StatusHeroProps {
  model: HeroModel;
  pill?: { label: string };
  children?: ReactNode;
}

/** The most prominent element: what's happening, in one glance. */
export function StatusHero({ model, pill, children }: StatusHeroProps) {
  return (
    <Card tone={model.tone} aria-label="Delivery status" className={styles.hero}>
      <div className={styles.head}>
        <IconBadge tone={model.tone} variant="solid" shape="circle" size={44}>
          <Icon name={ICONS[model.icon]} size={22} strokeWidth={2.25} />
        </IconBadge>
        <h2 className={styles.title}>{model.title}</h2>
        {pill && (
          <Pill tone="info" outline>
            {pill.label}
          </Pill>
        )}
      </div>
      <p className={styles.message}>{model.message}</p>
      <div className={styles.progress}>
        <div className={styles.segments} aria-hidden="true">
          {model.segments.map((tone, i) => (
            <span key={i} className={styles.segment} data-tone={tone === 'empty' ? undefined : tone} />
          ))}
        </div>
        <span className={styles.progressLabel}>{model.progressLabel}</span>
      </div>
      {children}
    </Card>
  );
}

function Panel({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.panel}>
      {icon}
      <div className={styles.panelBody}>{children}</div>
    </div>
  );
}

export function EtaPanel({ eta, serverTime }: { eta: TimeWindow; serverTime: string }) {
  const sameDay = isSameDay(eta.start, eta.end);
  const today = sameDay && isSameDay(eta.start, serverTime);
  return (
    <Panel icon={<Icon name="clock" size={20} className={styles.panelIcon} />}>
      <div className={styles.labelRow}>
        <span className={styles.panelLabel}>Estimated delivery</span>
        {today && <Pill tone="info">Today</Pill>}
      </div>
      <p className={`${styles.panelValue} tabular`}>{sameDay ? `Arriving ${formatWindow(eta)}` : formatWindow(eta)}</p>
    </Panel>
  );
}

export function DelayPanel({ delay, eta }: { delay: DelayInfo; eta: TimeWindow | null }) {
  return (
    <Panel icon={<Icon name="clock" size={20} className={styles.panelIconWarning} />}>
      <span className={styles.panelLabel}>New estimated delivery</span>
      <div className={styles.etaChange}>
        <s className={styles.struck}>
          <span className="visually-hidden">Originally </span>
          {formatDay(delay.originalEta.start)}
        </s>
        <Icon name="arrow-right" size={16} className={styles.arrow} aria-hidden="true" />
        <span className={`${styles.panelValue} tabular`}>
          <span className="visually-hidden">Now </span>
          {eta ? formatWindow(eta) : 'New estimate pending'}
        </span>
      </div>
      {!eta && <p className={styles.panelHint}>We’ll notify you as soon as the carrier shares a new date.</p>}
    </Panel>
  );
}

export function ProofPanel({ proof, onViewPhoto }: { proof: ProofOfDelivery; onViewPhoto: () => void }) {
  return (
    <div className={`${styles.panel} ${styles.proof}`}>
      {proof.hasPhoto && (
        <button type="button" className={styles.photoButton} onClick={onViewPhoto} aria-label="View delivery photo">
          <DeliveryPhoto size={72} />
          <span className={styles.photoTag}>Photo</span>
        </button>
      )}
      <div className={styles.panelBody}>
        <p className={styles.proofTitle}>Left at {proof.location.toLowerCase()}</p>
        <p className={`${styles.panelHint} tabular`}>{formatDateTime(proof.deliveredAt)} · Photo by driver</p>
        <p className={styles.signature}>
          <Icon name="pen" size={14} aria-hidden="true" />
          {proof.signatureRequired ? 'Signed on delivery' : 'No signature required'}
        </p>
      </div>
    </div>
  );
}

export function HeroFootnote({ children }: { children: ReactNode }) {
  return <p className={styles.footnote}>{children}</p>;
}
