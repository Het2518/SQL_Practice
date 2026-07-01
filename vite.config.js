import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['sql.js'],
  },
  assetsInclude: ['**/*.sql'],
  resolve: {
    alias: {
      '@': '/src'
    }
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
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router-dom/')) {
              return 'vendor';
            }
            if (id.includes('@monaco-editor')) {
              return 'monaco';
            }
            if (id.includes('sql.js') || id.includes('sql-formatter')) {
              return 'sql';
            }
            if (id.includes('react-resizable-panels') || id.includes('react-virtuoso') || id.includes('react-zoom-pan-pinch') || id.includes('lucide-react')) {
              return 'ui';
            }
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
