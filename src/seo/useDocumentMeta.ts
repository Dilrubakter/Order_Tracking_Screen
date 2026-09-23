import { useEffect } from 'react';
import { absoluteUrl, type PageMeta } from './meta';

function setTag(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function meta(key: 'name' | 'property', name: string, content: string) {
  setTag(
    `meta[${key}="${name}"]`,
    () => {
      const el = document.createElement('meta');
      el.setAttribute(key, name);
      return el;
    },
    'content',
    content,
  );
}

/**
 * Keeps the title, description, canonical and social tags in sync on client-side
 * navigation. Pre-rendered pages already ship the same tags (see `renderHeadTags`),
 * so this only updates existing elements rather than adding duplicates.
 */
export function useDocumentMeta({ title, description, path, noindex }: PageMeta) {
  useEffect(() => {
    const url = absoluteUrl(path);
    document.title = title;
    meta('name', 'description', description);
    meta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow');
    setTag(
      'link[rel="canonical"]',
      () => Object.assign(document.createElement('link'), { rel: 'canonical' }),
      'href',
      url,
    );
    meta('property', 'og:title', title);
    meta('property', 'og:description', description);
    meta('property', 'og:url', url);
    meta('name', 'twitter:title', title);
    meta('name', 'twitter:description', description);
  }, [title, description, path, noindex]);
}
