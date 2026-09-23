import { act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, StaticRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { App } from '@/App';
import { absoluteUrl, INDEXABLE_PAGES, NOT_FOUND_META, renderHeadTags, scenarioMeta } from '../meta';

describe('pre-rendered pages', () => {
  it.each(INDEXABLE_PAGES.map((p) => p.path))('%s hydrates without a mismatch', async (path) => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(
      <StaticRouter location={path}>
        <App />
      </StaticRouter>,
    );
    expect(container.querySelector('h1')).not.toBeNull();

    const onRecoverableError = vi.fn();
    const root = await act(async () =>
      hydrateRoot(
        container,
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>,
        { onRecoverableError },
      ),
    );
    expect(onRecoverableError).not.toHaveBeenCalled();
    act(() => root.unmount());
  });

  it('syncs head tags on the client', async () => {
    const container = document.createElement('div');
    const root = await act(async () => {
      const { createRoot } = await import('react-dom/client');
      const r = createRoot(container);
      r.render(
        <MemoryRouter initialEntries={['/track/delivered']}>
          <App />
        </MemoryRouter>,
      );
      return r;
    });
    const meta = scenarioMeta('delivered');
    expect(document.title).toBe(meta.title);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(meta.description);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(absoluteUrl(meta.path));
    act(() => root.unmount());
  });
});

describe('page meta', () => {
  it('gives every page a unique title and description of a sensible length', () => {
    const titles = new Set(INDEXABLE_PAGES.map((p) => p.title));
    const descriptions = new Set(INDEXABLE_PAGES.map((p) => p.description));
    expect(titles.size).toBe(INDEXABLE_PAGES.length);
    expect(descriptions.size).toBe(INDEXABLE_PAGES.length);
    for (const page of INDEXABLE_PAGES) {
      expect(page.title.length).toBeLessThanOrEqual(60);
      expect(page.description.length).toBeGreaterThanOrEqual(70);
      expect(page.description.length).toBeLessThanOrEqual(160);
    }
  });

  it('escapes attribute values and marks unknown pages noindex', () => {
    const html = renderHeadTags({ ...NOT_FOUND_META, description: 'a "quoted" <b>' });
    expect(html).toContain('content="a &quot;quoted&quot; &lt;b&gt;"');
    expect(html).toContain('<meta name="robots" content="noindex, follow" />');
  });
});
