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
  },
});
