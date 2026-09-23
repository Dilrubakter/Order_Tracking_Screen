import { Icon } from '@/components/icons/Icon';
import { Button } from '@/components/ui/Button';
import { Card, IconBadge } from '@/components/ui/Card';
import { useSupport } from './SupportContext';
import styles from './HelpCard.module.css';

interface HelpCardProps {
  title?: string;
  description?: string;
}

/** Always-visible support entry point, rendered in every tracking state. */
export function HelpCard({
  title = 'Need help with this order?',
  description = 'Our support team replies in about 2 minutes, 24/7.',
}: HelpCardProps) {
  const support = useSupport();
  return (
    <Card aria-labelledby="help-card-title">
      <div className={styles.head}>
        <IconBadge tone="brand">
          <Icon name="headset" size={20} />
        </IconBadge>
        <div className={styles.text}>
          <h2 id="help-card-title" className={styles.title}>
            {title}
          </h2>
          <p className={styles.description}>{description}</p>
        </div>
      </div>
      <div className={styles.actions}>
        <Button fullWidth onClick={() => support.open('menu')}>
          Contact Support
        </Button>
        <div className={styles.row}>
          <Button
            variant="secondary"
            size="sm"
            icon={<Icon name="chat" size={18} />}
            onClick={() => support.open('chat')}
          >
            Live chat
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Icon name="phone" size={18} />}
            onClick={() => support.open('call')}
          >
            Call us
          </Button>
        </div>
      </div>
    </Card>
  );
}
