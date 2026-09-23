import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource-variable/plus-jakarta-sans/wght.css';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { App } from './App';
import './styles/global.css';

// The single-file build is opened straight from disk, where only hash URLs work.
const Router = import.meta.env.MODE === 'single' ? HashRouter : BrowserRouter;

// BASE_URL is `/` locally and the repo sub-path on GitHub Pages.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

const app = (
  <StrictMode>
    <Router basename={basename}>
      <App />
    </Router>
  </StrictMode>
);

const root = document.getElementById('root')!;
// Pre-rendered pages (see scripts/prerender.mjs) already contain the markup.
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
