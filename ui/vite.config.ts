import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/incidents': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
      '/reflect': 'http://localhost:8000',
      '/insights': 'http://localhost:8000',
      '/stats': 'http://localhost:8000',
      '/demo': 'http://localhost:8000',
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
