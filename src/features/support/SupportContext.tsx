import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { SupportSheet } from './SupportSheet';

export type SupportView = 'menu' | 'chat' | 'call';

interface SupportContextValue {
  open: (view?: SupportView) => void;
}

const SupportContext = createContext<SupportContextValue | null>(null);

/**
 * Support must be reachable from every state, so it lives above the
 * screens: any component can open the sheet without prop drilling.
 */
export function SupportProvider({ orderId, children }: { orderId?: string; children: ReactNode }) {
  const [view, setView] = useState<SupportView | null>(null);
  const open = useCallback((next: SupportView = 'menu') => setView(next), []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <SupportContext.Provider value={value}>
      {children}
      <SupportSheet view={view} orderId={orderId} onNavigate={setView} onClose={() => setView(null)} />
    </SupportContext.Provider>
  );
}

export function useSupport(): SupportContextValue {
  const ctx = useContext(SupportContext);
  if (!ctx) throw new Error('useSupport must be used inside <SupportProvider>');
  return ctx;
}
