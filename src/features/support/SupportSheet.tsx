import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Icon, type IconName } from '@/components/icons/Icon';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import type { SupportView } from './SupportContext';
import { SUPPORT_PHONE_DISPLAY as SUPPORT_PHONE, SUPPORT_PHONE_TEL as SUPPORT_TEL } from '@/data/policies';
import { useMockChat } from './useMockChat';
import styles from './SupportSheet.module.css';

const QUICK_QUESTIONS = ['Where is my package?', 'Change delivery time', 'Talk to a person'];

interface SupportSheetProps {
  view: SupportView | null;
  orderId?: string;
  onNavigate: (view: SupportView) => void;
  onClose: () => void;
}

export function SupportSheet({ view, orderId, onNavigate, onClose }: SupportSheetProps) {
  const toast = useToast();
  // Lives here (not in ChatSheet) so the conversation survives switching views.
  const chat = useMockChat(orderId);
  const closeWith = (message: string) => {
    onClose();
    toast(message);
  };

  if (view === 'chat') return <ChatSheet chat={chat} onBack={() => onNavigate('menu')} onClose={onClose} />;

  if (view === 'call') {
    return (
      <Sheet open title="Call support" onClose={onClose}>
        <div className={styles.callInfo}>
          <span className={styles.muted}>Customer support · open 24/7</span>
          <span className={`${styles.phone} tabular`}>{SUPPORT_PHONE}</span>
          <span className={styles.hint}>Average wait under 2 minutes{orderId && ` · have #${orderId} ready`}</span>
        </div>
        <div className={styles.stack}>
          <a className={styles.callLink} href={`tel:${SUPPORT_TEL}`}>
            <Icon name="phone" size={20} strokeWidth={2} aria-hidden="true" />
            Call now
          </a>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => closeWith('Callback requested — we’ll call you within 10 minutes')}
          >
            Request a callback
          </Button>
          <Button variant="ghost" size="sm" fullWidth onClick={() => onNavigate('menu')}>
            Other ways to get help
          </Button>
        </div>
      </Sheet>
    );
  }

  const options: Array<{ icon: IconName; title: string; sub: string; onSelect: () => void }> = [
    {
      icon: 'chat',
      title: 'Live chat',
      sub: 'Typically replies in about 2 minutes',
      onSelect: () => onNavigate('chat'),
    },
    { icon: 'phone', title: 'Call us', sub: `24/7 · ${SUPPORT_PHONE}`, onSelect: () => onNavigate('call') },
    {
      icon: 'mail',
      title: 'Email support',
      sub: 'We reply within 24 hours',
      onSelect: () => closeWith('Email form would open here — we reply within 24 hours'),
    },
    {
      icon: 'book',
      title: 'Delivery help center',
      sub: 'Answers to common delivery questions',
      onSelect: () => closeWith('The help center would open here'),
    },
  ];

  return (
    <Sheet
      open={view === 'menu'}
      title="How can we help?"
      description={
        orderId ? `About order #${orderId}. Pick whatever is easiest for you.` : 'Pick whatever is easiest for you.'
      }
      onClose={onClose}
    >
      <ul className={styles.options}>
        {options.map(({ icon, title, sub, onSelect }) => (
          <li key={title}>
            <button type="button" className={styles.option} onClick={onSelect}>
              <Icon name={icon} size={22} className={styles.optionIcon} />
              <span className={styles.optionText}>
                <span className={styles.optionTitle}>{title}</span>
                <span className={styles.optionSub}>{sub}</span>
              </span>
              <Icon name="chevron-right" size={18} className={styles.chevron} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

interface ChatSheetProps {
  chat: ReturnType<typeof useMockChat>;
  onBack: () => void;
  onClose: () => void;
}

function ChatSheet({ chat, onBack, onClose }: ChatSheetProps) {
  const { messages, agentTyping, send } = chat;
  const [draft, setDraft] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, agentTyping]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    send(draft);
    setDraft('');
  };

  return (
    <Sheet
      open
      title="Live chat"
      onClose={onClose}
      footer={
        <>
          <div className={styles.quick}>
            {QUICK_QUESTIONS.map((q) => (
              <button key={q} type="button" className={styles.chip} onClick={() => send(q)}>
                {q}
              </button>
            ))}
          </div>
          <form className={styles.composer} onSubmit={submit}>
            <label htmlFor="chat-input" className="visually-hidden">
              Message
            </label>
            <input
              id="chat-input"
              className={styles.input}
              placeholder="Type a message"
              autoComplete="off"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" className={styles.send} aria-label="Send message" disabled={!draft.trim()}>
              <Icon name="send" size={20} strokeWidth={2} />
            </button>
          </form>
        </>
      }
    >
      <div className={styles.agentRow}>
        <span className={styles.online} aria-hidden="true" />
        <span className={styles.muted}>Tanvir from Support · online</span>
        <Button variant="ghost" size="sm" className={styles.otherOptions} onClick={onBack}>
          Other options
        </Button>
      </div>
      <div ref={logRef} className={styles.log} role="log" aria-live="polite">
        {messages.map((m) => (
          <p key={m.id} className={m.from === 'agent' ? styles.agent : styles.customer}>
            <span className="visually-hidden">{m.from === 'agent' ? 'Tanvir: ' : 'You: '}</span>
            {m.text}
          </p>
        ))}
        {agentTyping && (
          <p className={styles.typing}>
            <span className="visually-hidden">Tanvir is typing</span>
            <span aria-hidden="true">•••</span>
          </p>
        )}
      </div>
    </Sheet>
  );
}
