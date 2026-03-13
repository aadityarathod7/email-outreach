import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src/frontend',
  build: {
    outDir: '../../frontend-dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass(req) {
          // Only bypass actual source/asset file extensions, not API paths with dots (e.g. email addresses)
          if (/\.(ts|tsx|js|jsx|css|png|svg|ico|html|json|map|woff|woff2)(\?|$)/.test(req.url || '')) {
            return req.url;
          }
        },
      },
    },
  },
});
