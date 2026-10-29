import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/disputes': 'http://127.0.0.1:8000',
      '/sync': 'http://127.0.0.1:8000',
      '/timeline': 'http://127.0.0.1:8000',
      '/audit': 'http://127.0.0.1:8000',
      '/api': 'http://127.0.0.1:8000'
    }
  }
});
