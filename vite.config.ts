import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * VITE_BASE_PATH permite publicar em subcaminhos (ex.: GitHub Pages "/meu-repo/").
 * Em Vercel ou domínio próprio, deixe sem definir ("/").
 */
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icon.svg', 'icon-192x192.png', 'icon-512x512.png'],
      manifest: {
        name: 'Vocal Biomechanics Trainer',
        short_name: 'Vocal Trainer',
        description:
          'Treino vocal biomecânico guiado em 3 fases, com timers de prática e descanso e diário de sensações.',
        lang: 'pt-BR',
        theme_color: '#0e1318',
        background_color: '#0e1318',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Assets estáticos: cache primeiro
            urlPattern: ({ request }) =>
              ['style', 'script', 'worker', 'font', 'image'].includes(
                request.destination,
              ),
            handler: 'CacheFirst',
            options: {
              cacheName: 'vbt-assets',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Dados (JSON/documentos): rede primeiro, com fallback ao cache
            urlPattern: ({ request, url }) =>
              request.destination === 'document' ||
              url.pathname.endsWith('.json'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'vbt-data',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
});
