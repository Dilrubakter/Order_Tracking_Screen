import { loadEnv } from 'vite';
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

/** Makes `vite preview` serve /track/x from track/x.html, as GitHub Pages does. */
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
  // Sub-path the site is served from: `/` locally, `/<repo>/` on GitHub Pages (set by the deploy workflow).
  const base = process.env.BASE_PATH || '/';

  // Site URL for canonical, Open Graph and sitemap links. Set by the deploy workflow;
  // locally it falls back to the `vite preview` server. Putting it on process.env
  // exposes it to the app and to %VITE_SITE_URL% in index.html.
  process.env.VITE_SITE_URL =
    loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL || `http://localhost:4173${base.replace(/\/$/, '')}`;

  return {
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
