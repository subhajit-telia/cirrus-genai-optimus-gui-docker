/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Legacy build doubles bundle generation work; keep it opt-in.
    ...(process.env.VITE_ENABLE_LEGACY === 'true' ? [legacy()] : [])
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // React core — must be a single shared chunk
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) {
            return 'react-vendor'
          }

          // Ionic UI framework + Stencil runtime
          if (
            id.includes('@ionic/react') ||
            id.includes('@ionic/core') ||
            id.includes('@stencil/core') ||
            id.includes('ionicons')
          ) {
            return 'ionic'
          }

          // Routing
          if (
            id.includes('react-router-dom') ||
            id.includes('react-router/') ||
            id.includes('@reach/router')
          ) {
            return 'router'
          }

          // Azure AD / MSAL
          if (id.includes('@azure/msal-browser') || id.includes('@azure/msal-react')) {
            return 'azure'
          }

          // MDX editor (large standalone component)
          if (id.includes('@mdxeditor/editor') || id.includes('@mdxeditor/')) {
            return 'mdxeditor'
          }

          // Markdown / remark / rehype utilities
          if (
            id.includes('/remark/') ||
            id.includes('remark-gfm') ||
            id.includes('remark-html') ||
            id.includes('remark-parse') ||
            id.includes('remark-stringify') ||
            id.includes('react-markdown') ||
            id.includes('rehype-raw') ||
            id.includes('/rehype/') ||
            id.includes('/unified/') ||
            id.includes('/mdast') ||
            id.includes('/hast') ||
            id.includes('/micromark') ||
            id.includes('/marked/')
          ) {
            return 'markdown'
          }
        }
      }
    },
    // @ionic/core is a pre-compiled web-components bundle (~1,300 kB minified /
    // ~295 kB gzip) that cannot be split further. All other vendor chunks are
    // well under 500 kB. Raise the threshold to suppress the false positive.
    chunkSizeWarningLimit: 1400
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
