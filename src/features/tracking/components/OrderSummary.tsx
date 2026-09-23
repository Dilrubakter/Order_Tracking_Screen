import { useId, useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { Card, CardTitle } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Primitives';
import { formatAddressLines, formatAddressOneLine, formatMoney, pluralize } from '@/lib/format';
import type { Order, OrderItem } from '@/types/order';
import styles from './OrderSummary.module.css';

/** Product photo; decorative because the item name sits right next to it. */
export function ProductImage({ item, size = 72 }: { item: OrderItem; size?: number }) {
  return (
    <img className={styles.thumb} src={item.image} alt="" width={size} height={size} loading="lazy" decoding="async" />
  );
}

export function ItemRow({ item }: { item: OrderItem }) {
  return (
    <div className={styles.item}>
      <ProductImage item={item} />
      <div className={styles.itemBody}>
        <p className={styles.itemName} title={item.name}>
          {item.name}
        </p>
        <p className={styles.itemVariant}>{item.variant}</p>
        <div className={styles.itemFoot}>
          <span className={styles.qty}>Qty {item.quantity}</span>
          <span className={`${styles.price} tabular`}>{formatMoney(item.price)}</span>
        </div>
      </div>
    </div>
  );
}

export function OrderSummary({ order }: { order: Order }) {
  const [showAllItems, setShowAllItems] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const titleId = useId();
  const moreId = useId();
  const [first, ...rest] = order.items;

  return (
    <Card aria-labelledby={titleId}>
      <CardTitle id={titleId} aside={pluralize(order.items.length, 'item')}>
        Order summary
      </CardTitle>

      <ItemRow item={first} />

      {rest.length > 0 && (
        <>
          <button
            type="button"
            className={styles.moreButton}
            aria-expanded={showAllItems}
            aria-controls={moreId}
            onClick={() => setShowAllItems((v) => !v)}
          >
            <span className={styles.stack} aria-hidden="true">
              {rest.slice(0, 2).map((item) => (
                <ProductImage key={item.id} item={item} size={28} />
              ))}
            </span>
            <span className={styles.moreLabel}>
              {showAllItems ? 'Show fewer items' : `+${pluralize(rest.length, 'more item')}`}
            </span>
            <Icon name="chevron-down" size={18} strokeWidth={2} className={styles.chevron} data-open={showAllItems} />
          </button>
          {showAllItems && (
            <div id={moreId} className={styles.moreList}>
              {rest.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}

      <Divider />

      <div className={styles.totalRow}>
        <div className={styles.totalLabels}>
          <span className={styles.totalLabel}>Order total</span>
          <span className={styles.totalHint}>Incl. {formatMoney(order.shippingCost)} shipping</span>
        </div>
        <span className={`${styles.total} tabular`}>{formatMoney(order.total)}</span>
      </div>

      <Divider />

      <button
        type="button"
        className={styles.addressButton}
        aria-expanded={showAddress}
        onClick={() => setShowAddress((v) => !v)}
      >
        <Icon name="pin" size={20} className={styles.pin} aria-hidden="true" />
        <span className={styles.addressText}>
          <span className={styles.addressLabel}>Shipping to</span>
          {showAddress ? (
            formatAddressLines(order.shippingAddress).map((line) => (
              <span key={line} className={styles.addressLine}>
                {line}
              </span>
            ))
          ) : (
            <span className={styles.addressShort}>{formatAddressOneLine(order.shippingAddress)}</span>
          )}
        </span>
        <Icon name="chevron-down" size={18} strokeWidth={2} className={styles.chevronMuted} data-open={showAddress} />
      </button>
    </Card>
  );
}
