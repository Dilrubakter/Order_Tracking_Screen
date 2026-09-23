// Runs after the client and SSR builds: writes one static HTML file per route,
// plus sitemap.xml and 404.html, so crawlers and link previews get real content.
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ssrDir = join(root, 'dist-ssr');

const ssrEntry = readdirSync(ssrDir).find((f) => /^entry-server\.m?js$/.test(f));
if (!ssrEntry) throw new Error('SSR bundle not found; run `vite build --ssr src/entry-server.tsx` first');
const { render, INDEXABLE_PAGES, renderHeadTags, absoluteUrl } = await import(
  pathToFileURL(join(ssrDir, ssrEntry)).href
);

let template = readFileSync(join(dist, 'index.html'), 'utf8');

// Preload the body font so text doesn't wait on CSS → font discovery.
const fontDir = join(dist, 'assets');
const bodyFont = readdirSync(fontDir).find((f) => /^plus-jakarta-sans-latin-wght-normal.*\.woff2$/.test(f));
if (bodyFont) {
  const base = process.env.BASE_PATH || '/';
  template = template.replace(
    '</head>',
    `  <link rel="preload" href="${base}assets/${bodyFont}" as="font" type="font/woff2" crossorigin />\n  </head>`,
  );
}

const SEO_BLOCK = /<!-- seo:start[\s\S]*?<!-- seo:end -->/;
if (!SEO_BLOCK.test(template) || !template.includes('<!--app-html-->')) {
  throw new Error('index.html is missing the seo:start/seo:end markers or <!--app-html-->');
}

function page(meta, appHtml) {
  return template.replace(SEO_BLOCK, renderHeadTags(meta)).replace('<!--app-html-->', appHtml);
}

/** `/` → index.html, `/track/x` → track/x.html (GitHub Pages and Vercel `cleanUrls` serve it at /track/x). */
function fileFor(path) {
  return path === '/' ? 'index.html' : `${path.slice(1)}.html`;
}

for (const meta of INDEXABLE_PAGES) {
  const file = join(dist, fileFor(meta.path));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page(meta, render(meta.path)));
  console.log(`prerendered ${meta.path} → ${fileFor(meta.path)}`);
}

// Unknown URLs: an empty shell that the client app handles, kept out of the index.
const home = INDEXABLE_PAGES[0];
writeFileSync(
  join(dist, '404.html'),
  page({ ...home, title: 'Page not found – Order Tracking Demo', noindex: true }, ''),
);

const today = new Date().toISOString().slice(0, 10);
const urls = INDEXABLE_PAGES.map(
  (meta) =>
    `  <url>\n    <loc>${absoluteUrl(meta.path)}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${meta.path === '/' ? '1.0' : '0.8'}</priority>\n  </url>`,
).join('\n');
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

const robots = join(dist, 'robots.txt');
writeFileSync(robots, `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`);

if (existsSync(ssrDir)) rmSync(ssrDir, { recursive: true, force: true });
console.log('wrote 404.html, sitemap.xml, robots.txt');
