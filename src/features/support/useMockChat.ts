import { useCallback, useEffect, useRef, useState } from 'react';

export interface ChatMessage {
  id: number;
  from: 'agent' | 'customer';
  text: string;
}

const AGENT_REPLIES: Array<{ match: RegExp; reply: string }> = [
  {
    match: /where|status|track/i,
    reply: 'I can see your package in the carrier’s system. I’ll share the latest scan with you in just a moment.',
  },
  {
    match: /address|time|reschedule|change/i,
    reply:
      'I can help with that. Changes are possible until the driver is on their final approach — what would you like to change?',
  },
  {
    match: /person|human|agent|call/i,
    reply: 'You’re chatting with a real person — but I can also call you if that’s easier. Just say the word.',
  },
  {
    match: /refund|cancel|money/i,
    reply: 'I can check refund options for this order. One moment while I pull them up.',
  },
];

const FALLBACK = 'Thanks — I’m checking with the carrier now. I’ll have an answer for you in a moment.';

/** Scripted chat that replies after a short "typing" delay. */
export function useMockChat(orderId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 1,
      from: 'agent',
      text: `Hi Nusrat, I’m Tanvir from Support.${orderId ? ` I can see order #${orderId}.` : ''} How can I help today?`,
    },
  ]);
  const [agentTyping, setAgentTyping] = useState(false);
  const nextId = useRef(2);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const send = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: nextId.current++, from: 'customer', text }]);
    setAgentTyping(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const reply = AGENT_REPLIES.find((r) => r.match.test(text))?.reply ?? FALLBACK;
      setMessages((prev) => [...prev, { id: nextId.current++, from: 'agent', text: reply }]);
      setAgentTyping(false);
    }, 1200);
  }, []);

  return { messages, agentTyping, send };
}
