import { loadEnv } from 'vite';
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

/** `vite preview` equivalent of GitHub Pages / Vercel clean URLs: /track/x → /track/x.html. */
function cleanUrlsPreview(): Plugin {
  return {
    name: 'clean-urls-preview',
    configurePreviewServer(server) {
      const outDir = resolve(server.config.root, server.config.build.outDir);
      const base = server.config.base.replace(/\/$/, '');
      server.middlewares.use((req, _res, next) => {
        const path = req.url?.split('?')[0] ?? '/';
        const file = path.startsWith(base) ? path.slice(base.length) : path;
        if (file.length > 1 && !file.includes('.') && existsSync(`${outDir}${file}.html`)) {
          req.url = `${path}.html`;
        }
        next();
      });
    },
  };
}

// `vite build --mode single` inlines every asset into one index.html,
// which is handy for sharing a static demo.
export default defineConfig(({ mode }) => {
  // Site origin for canonical/OG URLs: VITE_SITE_URL (env or .env) wins, then Vercel's
  // production domain (a system env var on every Vercel build), then the local preview server.
  // Setting it on process.env exposes it to the app and to %VITE_SITE_URL% in index.html.
  const base = process.env.BASE_PATH || '/';
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  process.env.VITE_SITE_URL =
    loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL ||
    (vercelUrl ? `https://${vercelUrl}` : `http://localhost:4173${base.replace(/\/$/, '')}`);

  return {
    // Sub-path the site is served from, e.g. `/Order_Tracking_Screen/` on GitHub Pages.
    base,
    plugins: [react(), cleanUrlsPreview(), ...(mode === 'single' ? [viteSingleFile()] : [])],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    build: { outDir: mode === 'single' ? 'dist-single' : 'dist' },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: { modules: { classNameStrategy: 'non-scoped' } },
    },
  };
});
