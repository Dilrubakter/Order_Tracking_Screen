// Runs after the client and SSR builds. Writes one static HTML file per page, plus
// 404.html, sitemap.xml and robots.txt, so crawlers and link previews get real content.
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SSR_DIR = join(ROOT, 'dist-ssr');
const BASE_PATH = process.env.BASE_PATH || '/';

const SEO_BLOCK = /<!-- seo:start[\s\S]*?<!-- seo:end -->/;
const APP_HTML = '<!--app-html-->';

async function loadServerBundle() {
  const entry = readdirSync(SSR_DIR).find((f) => /^entry-server\.m?js$/.test(f));
  if (!entry) throw new Error('SSR bundle not found; run `vite build --ssr src/entry-server.tsx` first');
  return import(pathToFileURL(join(SSR_DIR, entry)).href);
}

function loadTemplate() {
  const template = readFileSync(join(DIST, 'index.html'), 'utf8');
  if (!SEO_BLOCK.test(template) || !template.includes(APP_HTML)) {
    throw new Error(`index.html is missing the seo:start/seo:end markers or ${APP_HTML}`);
  }
  return withBodyFontPreload(template);
}

/** Preloads the body font so text doesn't wait for the CSS to discover it. */
function withBodyFontPreload(template) {
  const font = readdirSync(join(DIST, 'assets')).find((f) => /^plus-jakarta-sans-latin-wght-normal.*\.woff2$/.test(f));
  if (!font) return template;
  const link = `<link rel="preload" href="${BASE_PATH}assets/${font}" as="font" type="font/woff2" crossorigin />`;
  return template.replace('</head>', `  ${link}\n  </head>`);
}

/** `/` → index.html, `/track/x` → track/x.html (GitHub Pages serves it at /track/x). */
function fileFor(path) {
  return path === '/' ? 'index.html' : `${path.slice(1)}.html`;
}

function writeFile(relativePath, contents) {
  const file = join(DIST, relativePath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents);
}

function sitemap(pages, absoluteUrl) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages.map(
    ({ path }) =>
      `  <url>\n    <loc>${absoluteUrl(path)}</loc>\n    <lastmod>${today}</lastmod>\n` +
      `    <priority>${path === '/' ? '1.0' : '0.8'}</priority>\n  </url>`,
  );
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
  );
}

const { render, renderHeadTags, absoluteUrl, INDEXABLE_PAGES, NOT_FOUND_META } = await loadServerBundle();
const template = loadTemplate();
const page = (meta, appHtml) => template.replace(SEO_BLOCK, renderHeadTags(meta)).replace(APP_HTML, appHtml);

for (const meta of INDEXABLE_PAGES) {
  writeFile(fileFor(meta.path), page(meta, render(meta.path)));
  console.log(`prerendered ${meta.path} → ${fileFor(meta.path)}`);
}

// Unknown URLs get an empty shell: the client app renders it, search engines skip it.
writeFile('404.html', page(NOT_FOUND_META, ''));
writeFile('sitemap.xml', sitemap(INDEXABLE_PAGES, absoluteUrl));
writeFile('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`);
console.log('wrote 404.html, sitemap.xml, robots.txt');

rmSync(SSR_DIR, { recursive: true, force: true });
