/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Legacy build doubles bundle generation work; keep it opt-in.
    ...(process.env.VITE_ENABLE_LEGACY === 'true' ? [legacy()] : [])
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          azure: ['@azure/msal-browser', '@azure/msal-react'],
          markdown: [
            '@mdxeditor/editor',
            'remark',
            'remark-gfm',
            'remark-html',
            'remark-parse',
            'remark-stringify',
            'react-markdown',
            'rehype-raw',
            'marked'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
