import { Icon } from '@/components/icons/Icon';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, IconBadge } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Primitives';
import { useToast } from '@/components/ui/Toast';
import { formatTime } from '@/lib/format';
import styles from './TrackingStates.module.css';

/** Skeleton that mirrors the real layout block-for-block (no blank page + spinner). */
export function TrackingSkeleton() {
  return (
    <>
      <p role="status" className="visually-hidden">
        Loading tracking details…
      </p>
      <Card aria-hidden="true" className={styles.skHero}>
        <div className={styles.skRow}>
          <Skeleton width={44} height={44} radius="50%" />
          <Skeleton width="62%" height={26} />
        </div>
        <div className={styles.skCol}>
          <Skeleton height={14} />
          <Skeleton width="72%" height={14} />
        </div>
        <div className={styles.skSegments}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={6} />
          ))}
        </div>
        <Skeleton height={76} radius={12} />
      </Card>
      <Card aria-hidden="true" className={styles.skTimeline}>
        <Skeleton width={140} height={16} />
        {[
          ['38%', '54%'],
          ['30%', '48%'],
          ['50%', '70%'],
          ['34%', '44%'],
        ].map(([a, b], i) => (
          <div key={i} className={styles.skStep}>
            <Skeleton width={24} height={24} radius="50%" />
            <div className={styles.skCol}>
              <Skeleton width={a} height={14} />
              <Skeleton width={b} height={12} />
            </div>
          </div>
        ))}
      </Card>
      <Card padding="row" aria-hidden="true">
        <Skeleton width={40} height={40} radius={12} />
        <div className={styles.skCol}>
          <Skeleton width="58%" height={12} />
          <Skeleton width="72%" height={16} />
        </div>
        <Skeleton width={44} height={44} radius={12} />
      </Card>
      <Card aria-hidden="true">
        <Skeleton width={130} height={16} />
        <div className={styles.skRow}>
          <Skeleton width={72} height={72} radius={12} />
          <div className={styles.skCol}>
            <Skeleton width="92%" height={14} />
            <Skeleton width="60%" height={14} />
            <Skeleton width="40%" height={12} />
          </div>
        </div>
        <Skeleton height={44} radius={12} />
      </Card>
    </>
  );
}

export function TrackingErrorCard({ errorCode, failedAt }: { errorCode: string; failedAt: string }) {
  return (
    <Card tone="danger" role="alert" className={styles.error}>
      <div className={styles.errorHead}>
        <IconBadge tone="danger" variant="solid" shape="circle" size={44}>
          <Icon name="wifi-off" size={22} strokeWidth={2.25} />
        </IconBadge>
        <h2 className={styles.errorTitle}>Couldn’t load tracking</h2>
      </div>
      <p className={styles.errorBody}>
        We couldn’t reach our tracking service. Check your connection and try again — your order itself isn’t affected.
      </p>
      <p className={`${styles.errorMeta} tabular`}>
        Error {errorCode} · Last attempt {formatTime(failedAt)}
      </p>
    </Card>
  );
}

export function NoActiveOrders() {
  const toast = useToast();
  return (
    <section className={styles.empty} aria-labelledby="empty-title">
      <div className={styles.illustration} aria-hidden="true">
        <Icon name="box" size={52} strokeWidth={1.5} />
        <span className={styles.illustrationBadge}>
          <Icon name="search" size={18} strokeWidth={2} />
        </span>
      </div>
      <h2 id="empty-title" className={styles.emptyTitle}>
        No active orders
      </h2>
      <p className={styles.emptyBody}>
        When you place an order, you’ll be able to follow every step of its delivery here.
      </p>
      <div className={styles.emptyActions}>
        <Button
          size="lg"
          fullWidth
          icon={<Icon name="bag" size={20} />}
          onClick={() => toast('This would take you to the store home page')}
        >
          Continue shopping
        </Button>
        <Button variant="ghost" fullWidth onClick={() => toast('This would open your order history')}>
          View past orders
        </Button>
      </div>
    </section>
  );
}

export function NotFoundCard() {
  return (
    <Card>
      <CardTitle>We couldn’t find that order</CardTitle>
      <p className={styles.errorBody}>The link may be out of date. Go back to pick another order.</p>
    </Card>
  );
}
