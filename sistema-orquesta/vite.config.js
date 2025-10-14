import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Rutas relativas desde el frontend que deben ir al backend Express
      '/auth': { target: 'http://localhost:4000', changeOrigin: true },
      // Opcional: habilitar si consumes rutas relativas adicionales
      '/administracion': { target: 'http://localhost:4000', changeOrigin: true },
      '/dashboard': { target: 'http://localhost:4000', changeOrigin: true },
      '/alumnos': { target: 'http://localhost:4000', changeOrigin: true },
      '/instrumentos': { target: 'http://localhost:4000', changeOrigin: true },
      '/representantes': { target: 'http://localhost:4000', changeOrigin: true },
      '/eventos': { target: 'http://localhost:4000', changeOrigin: true },
      '/reportes': { target: 'http://localhost:4000', changeOrigin: true },
      '/programas': { target: 'http://localhost:4000', changeOrigin: true },
      '/usuarios': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
})
