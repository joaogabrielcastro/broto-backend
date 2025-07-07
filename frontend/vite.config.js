// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Aqui você pode adicionar outras configurações do Vite, se precisar
  // Por exemplo, configurar um proxy para o seu backend
  server: {
    proxy: {
      '/api': { // Se suas rotas de API começassem com /api (ex: /api/caminhoes)
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
