import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      },
      workbox: {
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      includeAssets: ['favicon.ico', 'favicon.png', 'app_logo/icon-192.png', 'app_logo/icon-512.png'],
      manifest: {
        name: 'velplay365',
        short_name: 'velplay365',
        theme_color: '#E49C16',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: '/app_logo/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/app_logo/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/app_logo/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/agent': {
        target: 'https://api.velplay365.com',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'https://api.velplay365.com',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
  },
})

// force rebuild: 2

