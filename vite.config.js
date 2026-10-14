import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const builtAt = new Date();
const buildId = builtAt.toISOString();
const versionPayload = {
  id: buildId,
  builtAt: builtAt.toISOString(),
  version: pkg.version,
};

function versionPlugin() {
  const body = JSON.stringify(versionPayload);
  function serveVersion(req, res, next) {
    const path = req.url?.split('?')[0];
    if (path !== '/version.json') {
      next();
      return;
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.end(body);
  }

  return {
    name: 'learn-sd-version',
    configureServer(server) {
      server.middlewares.use(serveVersion);
    },
    configurePreviewServer(server) {
      server.middlewares.use(serveVersion);
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: body,
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), versionPlugin()],
  envDir: '.',
  define: {
    'import.meta.env.VITE_BUILD_ID': JSON.stringify(versionPayload.id),
    'import.meta.env.VITE_BUILT_AT': JSON.stringify(versionPayload.builtAt),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(versionPayload.version),
  },
});
