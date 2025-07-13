import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'LIF3 Financial Dashboard',
        short_name: 'LIF3',
        description: 'Personal wealth tracking to R1.8M target',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'https://lif3-backend-clean.onrender.com',
        changeOrigin: true,
        secure: true
      },
      '/socket.io': {
        target: 'https://lif3-backend-clean.onrender.com',
        changeOrigin: true,
        ws: true,
        secure: true
      }
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
})