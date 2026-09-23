import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import { ScenarioPicker } from '@/features/scenarios/ScenarioPicker';
import { TrackOrderPage } from '@/features/tracking/TrackOrderPage';

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
