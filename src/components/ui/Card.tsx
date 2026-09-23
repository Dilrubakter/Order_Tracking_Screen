import type { HTMLAttributes, ReactNode } from 'react';
import type { Tone } from '@/types/tone';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLElement> {
  tone?: Tone;
  padding?: 'md' | 'lg' | 'row';
  as?: 'section' | 'div';
  children: ReactNode;
}

/** Surface for every block on the screen; `tone` gives the tinted status variant. */
export function Card({ tone, padding = 'lg', as: Tag = 'section', className, children, ...rest }: CardProps) {
  const cls = [styles.card, styles[padding], tone ? styles.toned : styles.plain, className].filter(Boolean).join(' ');
  return (
    <Tag className={cls} data-tone={tone} {...rest}>
      {children}
    </Tag>
  );
}

export function CardTitle({ id, children, aside }: { id?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className={styles.titleRow}>
      <h2 id={id} className={styles.title}>
        {children}
      </h2>
      {aside && <span className={styles.aside}>{aside}</span>}
    </div>
  );
}

/** Round (or rounded-square) icon badge used across cards. */
export function IconBadge({
  tone = 'neutral',
  variant = 'soft',
  shape = 'square',
  size = 40,
  children,
}: {
  tone?: Tone | 'brand';
  variant?: 'soft' | 'solid';
  shape?: 'square' | 'circle';
  size?: number;
  children: ReactNode;
}) {
  return (
    <span
      className={[styles.badge, styles[variant], shape === 'circle' && styles.circle].filter(Boolean).join(' ')}
      data-tone={tone}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export function Pill({ tone = 'neutral', children, outline }: { tone?: Tone; children: ReactNode; outline?: boolean }) {
  return (
    <span className={[styles.pill, outline && styles.pillOutline].filter(Boolean).join(' ')} data-tone={tone}>
      {children}
    </span>
  );
}
