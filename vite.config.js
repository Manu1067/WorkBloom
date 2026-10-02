import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { apiMiddleware } from './server-api.js';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'workbloom-api-middleware',
      configureServer(server) {
        server.middlewares.use(apiMiddleware);
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    proxy: {
      // Routes to the real Spring Boot backend (backend/), kept separate
      // from '/api' (handled above by the server-api.js mock middleware)
      // so both can be exercised side by side during the migration.
      // Requires the backend running locally on port 8080 - see docs/SETUP.md.
      '/spring-api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/spring-api/, '/api'),
      },
      // Destination images shipped under backend/src/main/resources/static/
      // are served by Spring Boot at the plain '/images/...' path (Spring's
      // default static-resource mapping). Proxied here too so <img src="...">
      // tags using the path returned by the Travel API resolve correctly
      // against the frontend's own origin in dev.
      '/images': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Uploaded Impact activity photos are stored by Spring Boot and served
      // read-only from '/uploads/...'; proxied like '/images' so <img> tags
      // resolve against the frontend origin in dev.
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
