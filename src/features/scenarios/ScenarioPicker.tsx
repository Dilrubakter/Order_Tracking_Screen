import { Link } from 'react-router-dom';
import { Icon, type IconName } from '@/components/icons/Icon';
import { resetMockApi } from '@/api/trackingApi';
import { Button } from '@/components/ui/Button';
import { Card, IconBadge } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { DEMO_ORDER_ID } from '@/data/mockOrders';
import { SCENARIOS, type Scenario, type ScenarioId } from '@/data/scenarios';
import { HOME_META } from '@/seo/meta';
import { useDocumentMeta } from '@/seo/useDocumentMeta';
import styles from './ScenarioPicker.module.css';

const ICONS: Record<ScenarioId, IconName> = {
  'out-for-delivery': 'truck',
  'slow-network': 'loader',
  'network-error': 'wifi-off',
  'no-active-orders': 'box',
  delayed: 'clock',
  'delayed-no-eta': 'clock',
  delivered: 'check',
  'awaiting-carrier': 'box',
};

const GROUPS: Scenario['group'][] = ['Core states', 'Edge cases'];

/** Demo entry point: every tracking state of the same order, one tap away. */
export function ScenarioPicker() {
  const toast = useToast();
  useDocumentMeta(HOME_META);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Demo · Order #{DEMO_ORDER_ID}</p>
        <h1 className={styles.title}>Order tracking</h1>
        <p className={styles.lead}>Pick a scenario to open the tracking screen in that state.</p>
      </header>

      {GROUPS.map((group) => (
        <Card key={group} padding="md" className={styles.group} aria-labelledby={`group-${group}`}>
          <h2 id={`group-${group}`} className={styles.groupTitle}>
            {group}
          </h2>
          <ul className={styles.list}>
            {SCENARIOS.filter((s) => s.group === group).map((scenario) => {
              return (
                <li key={scenario.id}>
                  <Link to={`/track/${scenario.id}`} className={styles.row}>
                    <IconBadge tone={scenario.tone} variant="solid" shape="circle">
                      <Icon name={ICONS[scenario.id]} size={20} strokeWidth={2} />
                    </IconBadge>
                    <span className={styles.rowText}>
                      <span className={styles.rowTitle}>{scenario.title}</span>
                      <span className={styles.rowSub}>{scenario.description}</span>
                    </span>
                    <Icon name="chevron-right" size={20} className={styles.chevron} aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      ))}

      <Button
        variant="ghost"
        size="sm"
        icon={<Icon name="reset" size={16} />}
        onClick={() => {
          resetMockApi();
          toast('Demo data reset');
        }}
      >
        Reset demo data
      </Button>
    </div>
  );
}
