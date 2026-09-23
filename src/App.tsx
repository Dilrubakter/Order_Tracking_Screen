import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import { ScenarioPicker } from '@/features/scenarios/ScenarioPicker';
import { TrackOrderPage } from '@/features/tracking/TrackOrderPage';

/** Router basename: `/` locally, the repo sub-path (e.g. `/Order_Tracking_Screen`) on GitHub Pages. */
export const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

/**
 * Routes only; the router comes from the entry point: BrowserRouter in the
 * browser, StaticRouter when pre-rendering, HashRouter in the single-file build.
 */
export function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<ScenarioPicker />} />
        <Route path="/track/:scenarioId" element={<TrackOrderPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
