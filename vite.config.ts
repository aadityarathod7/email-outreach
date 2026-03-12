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
      '/api/emails': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/stats': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/config': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/gmail': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/health': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
