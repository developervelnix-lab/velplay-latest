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
      includeAssets: ['favicon.png', 'app_logo/icon-192.png', 'app_logo/icon-512.png', 'screenshots/*.png'],
      manifest: {
        name: 'velplay365 Official Platform',
        short_name: 'velplay365',
        description: 'velplay365 Gaming & Sports Betting Platform. High odds, fast withdrawals, and exclusive promotions.',
        theme_color: '#E49C16',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'any',
        categories: ['games', 'entertainment', 'finance'],
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
        ],
        screenshots: [
          {
            src: 'screenshots/mobile.png',
            sizes: '625x717',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: 'screenshots/desktop.png',
            sizes: '1783x985',
            type: 'image/png',
            form_factor: 'wide'
          }
        ],
        shortcuts: [
          {
            name: 'Quick Deposit',
            url: '/deposit',
            icons: [{ src: '/app_logo/icon-192.png', sizes: '192x192', type: 'image/png' }]
          },
          {
            name: 'Active Promotions',
            url: '/promotion',
            icons: [{ src: '/app_logo/icon-192.png', sizes: '192x192', type: 'image/png' }]
          }
        ],
        prefer_related_applications: false,
        launch_handler: {
          client_mode: 'focus-existing'
        }
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://velplay365.com',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  preview: {
    // Vite handles history API fallback automatically
  },
})