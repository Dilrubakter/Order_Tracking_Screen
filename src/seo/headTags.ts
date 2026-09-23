import { absoluteUrl, type PageMeta } from './meta';

export interface MetaTag {
  attr: 'name' | 'property';
  key: string;
  content: string;
}

/** Per-page `<meta>` tags. The title and canonical link are set alongside them. */
export function metaTags({ title, description, path, noindex }: PageMeta): MetaTag[] {
  const url = absoluteUrl(path);
  return [
    { attr: 'name', key: 'description', content: description },
    { attr: 'name', key: 'robots', content: noindex ? 'noindex, follow' : 'index, follow' },
    { attr: 'property', key: 'og:title', content: title },
    { attr: 'property', key: 'og:description', content: description },
    { attr: 'property', key: 'og:url', content: url },
    { attr: 'name', key: 'twitter:title', content: title },
    { attr: 'name', key: 'twitter:description', content: description },
  ];
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Head tags as HTML, for pre-rendered pages. `useDocumentMeta` applies the same set in the browser. */
export function renderHeadTags(meta: PageMeta): string {
  return [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(absoluteUrl(meta.path))}" />`,
    ...metaTags(meta).map(({ attr, key, content }) => `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`),
  ].join('\n    ');
}
