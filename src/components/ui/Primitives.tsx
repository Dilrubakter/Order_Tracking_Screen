import { useId, type CSSProperties, type ReactNode } from 'react';
import styles from './Primitives.module.css';

/** Shimmering placeholder block for skeleton screens. */
export function Skeleton({
  width = '100%',
  height,
  radius,
  style,
}: {
  width?: CSSProperties['width'];
  height: number;
  radius?: number | string;
  style?: CSSProperties;
}) {
  return (
    <span className={styles.skeleton} style={{ width, height, borderRadius: radius, ...style }} aria-hidden="true" />
  );
}

interface SwitchRowProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

/** A full-width row whose label toggles a native checkbox with switch semantics. */
export function SwitchRow({ checked, onChange, label, description, icon, disabled }: SwitchRowProps) {
  const id = useId();
  return (
    <div className={styles.switchRow}>
      {icon}
      <label htmlFor={id} className={styles.switchLabel}>
        <span className={styles.switchTitle}>{label}</span>
        {description && <span className={styles.switchDescription}>{description}</span>}
      </label>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className={styles.switch}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  );
}

export function Divider() {
  return <hr className={styles.divider} />;
}
