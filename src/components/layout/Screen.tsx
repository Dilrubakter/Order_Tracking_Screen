import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/icons/Icon';
import { IconButton } from '@/components/ui/Button';
import styles from './Screen.module.css';

interface TopBarProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  onHelp?: () => void;
}

export function TopBar({ title, subtitle, backTo, onHelp }: TopBarProps) {
  return (
    <header className={styles.topBar}>
      {backTo ? (
        <Link to={backTo} className={styles.back} aria-label="Back">
          <Icon name="chevron-left" size={26} strokeWidth={2} />
        </Link>
      ) : (
        <span className={styles.spacer} />
      )}
      <div className={styles.titles}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {onHelp ? (
        <IconButton label="Get help" onClick={onHelp}>
          <Icon name="headset" size={22} />
        </IconButton>
      ) : (
        <span className={styles.spacer} />
      )}
    </header>
  );
}

interface ScreenProps {
  topBar: ReactNode;
  children: ReactNode;
  /** Primary next step, pinned in thumb reach. */
  actions?: ReactNode;
  busy?: boolean;
}

/** Mobile screen scaffold: top bar, scrolling content, optional sticky action bar. */
export function Screen({ topBar, children, actions, busy }: ScreenProps) {
  return (
    <div className={styles.screen}>
      {topBar}
      <main className={styles.content} aria-busy={busy || undefined}>
        {children}
      </main>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

export function ActionNote({ children }: { children: ReactNode }) {
  return <p className={styles.actionNote}>{children}</p>;
}
