import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // /api — токен-авторизация, CSRF не задействован.
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
      // /cookies — обычные Django-вью с CsrfViewMiddleware: Django сверяет
      // Origin с Host. При changeOrigin:true Host заменялся бы на :8000,
      // а браузер шлёт Origin :3000 — это дало бы 403 CSRF. Оставляем Host
      // как есть, чтобы Origin совпадал.
      '/cookies': { target: 'http://localhost:8000', changeOrigin: false },
    },
  },
  build: {
    outDir: 'build',
  },

});
