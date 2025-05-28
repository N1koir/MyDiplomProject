import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src', // Алиас для удобных импортов
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5226',
        // target: 'https://localhost:7213',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Сохраняем префикс /api
        headers: {
          Connection: 'Keep-Alive'
        }
      },
    },
    port: 5173,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react-router-dom'],
  }
});