import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/icons/Icon';
import { formatDateTime } from '@/lib/format';
import type { ProofOfDelivery } from '@/types/order';
import { DeliveryPhoto } from './DeliveryPhoto';
import styles from './PhotoViewer.module.css';

interface PhotoViewerProps {
  open: boolean;
  proof: ProofOfDelivery;
  carrierName?: string;
  onClose: () => void;
}

export function PhotoViewer({ open, proof, carrierName, onClose }: PhotoViewerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className={styles.viewer}
      role="dialog"
      aria-modal="true"
      aria-label="Delivery photo"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <button ref={closeRef} type="button" className={styles.close} aria-label="Close photo" onClick={onClose}>
        <Icon name="close" size={22} strokeWidth={2} />
      </button>
      <div className={styles.photo}>
        <DeliveryPhoto size={320} />
      </div>
      <p className={styles.caption}>Left at {proof.location.toLowerCase()}</p>
      <p className={styles.meta}>
        {formatDateTime(proof.deliveredAt)} · Photo by {carrierName ?? 'the'} driver
      </p>
    </div>,
    document.body,
  );
}
