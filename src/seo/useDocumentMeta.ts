import { useEffect } from 'react';
import { metaTags } from './headTags';
import { absoluteUrl, type PageMeta } from './meta';

/** Finds a head element by selector, creating it on first use. */
function headElement<T extends HTMLElement>(selector: string, create: () => T): T {
  const existing = document.head.querySelector<T>(selector);
  if (existing) return existing;
  const el = create();
  document.head.appendChild(el);
  return el;
}

/**
 * Keeps the title, canonical link and meta tags in sync on client-side navigation.
 * Pre-rendered pages already ship these tags (see `renderHeadTags`), so existing
 * elements are updated rather than duplicated.
 */
export function useDocumentMeta(meta: PageMeta) {
  const { title, description, path, noindex } = meta;

  useEffect(() => {
    const page = { title, description, path, noindex };
    document.title = title;

    headElement('link[rel="canonical"]', () =>
      Object.assign(document.createElement('link'), { rel: 'canonical' }),
    ).href = absoluteUrl(path);

    for (const { attr, key, content } of metaTags(page)) {
      headElement(`meta[${attr}="${key}"]`, () => {
        const el = document.createElement('meta');
        el.setAttribute(attr, key);
        return el;
      }).content = content;
    }
  }, [title, description, path, noindex]);
}
