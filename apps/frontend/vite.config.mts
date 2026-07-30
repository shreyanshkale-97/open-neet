import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/frontend',
  server: {
    port: 4200,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 4200,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@neet-ai/shared/types': path.resolve(__dirname, '../../libs/shared/types/src/index.ts'),
      '@neet-ai/shared/constants': path.resolve(__dirname, '../../libs/shared/constants/src/index.ts'),
      '@neet-ai/shared/validators': path.resolve(__dirname, '../../libs/shared/validators/src/index.ts'),
      '@neet-ai-platform/types': path.resolve(__dirname, '../../libs/shared/types/src/index.ts'),
      '@neet-ai-platform/constants': path.resolve(__dirname, '../../libs/shared/constants/src/index.ts'),
      '@neet-ai-platform/validators': path.resolve(__dirname, '../../libs/shared/validators/src/index.ts'),
    },
  },
  plugins: [react()],
  build: {
    outDir: '../../dist/apps/frontend',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});