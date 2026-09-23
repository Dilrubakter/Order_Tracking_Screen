import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { App, ROUTER_BASENAME } from './App';

// Used by scripts/prerender.mjs.
export { absoluteUrl, INDEXABLE_PAGES, NOT_FOUND_META } from './seo/meta';
export { renderHeadTags } from './seo/headTags';

/** Renders one route (a path without the base, e.g. `/track/delayed`) to HTML at build time. */
export function render(path: string): string {
  const location = ROUTER_BASENAME === '/' ? path : ROUTER_BASENAME + path;
  return renderToString(
    <StrictMode>
      <StaticRouter basename={ROUTER_BASENAME} location={location}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
}
