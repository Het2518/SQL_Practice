import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'sql-wasm.wasm'],
      manifest: {
        name: 'DataDesk - SQL Practice Platform',
        short_name: 'DataDesk',
        description: 'Practice SQL interactively directly in your browser.',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['sql.js'],
  },
  assetsInclude: ['**/*.sql'],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react/') ||
              id.includes('react-dom/') ||
              id.includes('react-router-dom/')
            ) {
              return 'vendor';
            }
            if (id.includes('@monaco-editor')) {
              return 'monaco';
            }
            if (id.includes('sql.js') || id.includes('sql-formatter')) {
              return 'sql';
            }
            if (
              id.includes('react-resizable-panels') ||
              id.includes('react-virtuoso') ||
              id.includes('react-zoom-pan-pinch') ||
              id.includes('lucide-react')
            ) {
              return 'ui';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: 'hidden',
  },
});
