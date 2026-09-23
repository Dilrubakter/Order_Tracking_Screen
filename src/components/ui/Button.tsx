import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'lg' | 'md' | 'sm';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

function classes(
  { variant = 'primary', size = 'md', fullWidth }: Omit<CommonProps, 'children' | 'icon'>,
  extra?: string,
) {
  return [styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, extra].filter(Boolean).join(' ');
}

export type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, icon, fullWidth, loading, children, className, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={classes({ variant, size, fullWidth }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : icon}
      <span>{children}</span>
    </button>
  );
});

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  bordered?: boolean;
}

/** Square 44px icon-only button; `label` becomes the accessible name. */
export function IconButton({ label, children, bordered, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={[styles.iconButton, bordered && styles.bordered, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
