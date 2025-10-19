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
      // Proxy API endpoints to backend, but bypass proxy for browser navigation
      // (requests that accept HTML) so the dev server serves index.html and
      // the SPA router can handle client-side routes like /administracion.
      // This keeps API proxying while avoiding 404s when the user navigates
      // directly to SPA routes in the browser.
      '/auth': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        bypass: function (req) {
          if (req.headers && req.headers.accept && req.headers.accept.indexOf('text/html') !== -1) {
            return '/index.html'
          }
        }
      },
      // Additional API endpoints. Keep them proxied but bypass HTML navigation.
      '/alumnos': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        bypass: function (req) {
          if (req.headers && req.headers.accept && req.headers.accept.indexOf('text/html') !== -1) {
            return '/index.html'
          }
        }
      },
      '/instrumentos': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        bypass: function (req) {
          if (req.headers && req.headers.accept && req.headers.accept.indexOf('text/html') !== -1) {
            return '/index.html'
          }
        }
      },
      '/representantes': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        bypass: function (req) {
          if (req.headers && req.headers.accept && req.headers.accept.indexOf('text/html') !== -1) {
            return '/index.html'
          }
        }
      },
      '/eventos': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        bypass: function (req) {
          if (req.headers && req.headers.accept && req.headers.accept.indexOf('text/html') !== -1) {
            return '/index.html'
          }
        }
      },
      '/dashboard': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        bypass: function (req) {
          if (req.headers && req.headers.accept && req.headers.accept.indexOf('text/html') !== -1) {
            return '/index.html'
          }
        }
      },
      '/reportes': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        bypass: function (req) {
          if (req.headers && req.headers.accept && req.headers.accept.indexOf('text/html') !== -1) {
            return '/index.html'
          }
        }
      },
      '/programas': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        bypass: function (req) {
          if (req.headers && req.headers.accept && req.headers.accept.indexOf('text/html') !== -1) {
            return '/index.html'
          }
        }
      },
      '/usuarios': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        bypass: function (req) {
          if (req.headers && req.headers.accept && req.headers.accept.indexOf('text/html') !== -1) {
            return '/index.html'
          }
        }
      },
      '/administracion': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        bypass: function (req) {
          if (req.headers && req.headers.accept && req.headers.accept.indexOf('text/html') !== -1) {
            return '/index.html'
          }
        }
      }
    },
  },
})
