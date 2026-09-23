import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { App } from './App';

export { INDEXABLE_PAGES, renderHeadTags, absoluteUrl } from './seo/meta';

/** Renders one route (a path without the base, e.g. `/track/delayed`) to HTML at build time. */
export function render(url: string): string {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '');
  return renderToString(
    <StrictMode>
      <StaticRouter basename={basename || '/'} location={basename + url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
}
