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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
          // Animation & UI framework
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          // Icon libraries (large)
          if (id.includes('node_modules/react-icons') || id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // Swiper carousel
          if (id.includes('node_modules/swiper')) {
            return 'vendor-swiper';
          }
          // Flowbite (heavy UI kit)
          if (id.includes('node_modules/flowbite')) {
            return 'vendor-flowbite';
          }
          // FontAwesome
          if (id.includes('node_modules/@fortawesome')) {
            return 'vendor-fontawesome';
          }
          // Radix UI
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix';
          }
          // Other vendor libs
          if (id.includes('node_modules/axios') || id.includes('node_modules/date-fns') || id.includes('node_modules/react-select') || id.includes('node_modules/react-tooltip') || id.includes('node_modules/sweetalert2')) {
            return 'vendor-utils';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
  },
})
