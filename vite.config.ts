import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use base path for production builds (GitHub Pages)
  // For local dev (mode === 'development'), use root path
  const base = mode === 'production' ? '/browser_gaming_zone/' : '/'
  
  return {
    base,
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/games': path.resolve(__dirname, './src/games'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/hooks': path.resolve(__dirname, './src/hooks'),
        '@/utils': path.resolve(__dirname, './src/utils'),
      },
    },
  }
})

