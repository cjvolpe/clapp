import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Clapp',
        short_name: 'Clapp',
        description: "UNC Chapel Hill's Very Own Mountain Project",
        theme_color: '#ffffff',
        icons: [
          {
            src: './src/lib/resources/clapping-hands.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: './src/lib/resources/clapping-hands.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  server: {
    allowedHosts: [
      'clapp.cjvolpe.dev'
    ],
    host: '0.0.0.0',
    port: 5173
  }
});
