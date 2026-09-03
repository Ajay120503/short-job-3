import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    ...(mode === 'production'
      ? [
          VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png'],
            manifest: {
              name: 'ShortJob',
              short_name: 'ShortJob',
              description: 'Academic Social Network - Where Academic Careers Begin',
              theme_color: '#147F83',
              background_color: '#F7FBFA',
              display: 'standalone',
              start_url: '/',
              icons: [
                {
                  src: 'icons/icon-192.png',
                  sizes: '192x192',
                  type: 'image/png',
                },
                {
                  src: 'icons/icon-512.png',
                  sizes: '512x512',
                  type: 'image/png',
                },
              ],
            },
            workbox: {
              globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
              navigateFallback: '/index.html',
              navigateFallbackDenylist: [/^\/api\//, /^\/socket.io\//],
              navigateFallbackAllowlist: [/^\/[^.]*$/],
              runtimeCaching: [
                {
                  urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                  handler: 'CacheFirst',
                  options: {
                    cacheName: 'google-fonts-cache',
                    expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                  },
                },
                {
                  urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
                  handler: 'NetworkFirst',
                  options: {
                    cacheName: 'cloudinary-cache',
                    expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
                  },
                },
              ],
            },
          }),
        ]
      : []),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
}))
