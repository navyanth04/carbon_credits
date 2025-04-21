import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    // ---- PWA plugin setup ----
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',        // will inject the registration snippet into your index.html
      includeAssets: [
        'favicon.svg',
        'robots.txt',
        'apple-touch-icon.png'
      ],
      manifest: {
        name:             'Carbon Credits Platform',
        short_name:       'CarbonCredits',
        description:      'Save the planet by tracking your green choices',
        theme_color:      '#10B981',
        background_color: '#ffffff',
        display:          'standalone',
        scope:            '/',
        start_url:        '/',
        icons: [
          {
            src:   'pwa-192x192.png',
            sizes: '192x192',
            type:  'image/png'
          },
          {
            src:   'pwa-512x512.png',
            sizes: '512x512',
            type:  'image/png'
          },
          {
            src:     'pwa-512x512.png',
            sizes:   '512x512',
            type:    'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})

