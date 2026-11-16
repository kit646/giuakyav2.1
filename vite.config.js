import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/giuakyav2.1/',
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/')
          if (!normalizedId.includes('/node_modules/')) return undefined

          if (
            normalizedId.includes('/node_modules/react/') ||
            normalizedId.includes('/node_modules/react-dom/') ||
            normalizedId.includes('/node_modules/scheduler/')
          ) {
            return 'vendor-react'
          }
          if (
            normalizedId.includes('/node_modules/gsap/') ||
            normalizedId.includes('/node_modules/@gsap/')
          ) {
            return 'vendor-gsap'
          }
          if (normalizedId.includes('/node_modules/lenis/')) {
            return 'vendor-lenis'
          }
          if (normalizedId.includes('/node_modules/lucide-react/')) {
            return 'vendor-lucide'
          }
          if (normalizedId.includes('/node_modules/qrcode/')) {
            return 'vendor-qrcode'
          }
          if (normalizedId.includes('/node_modules/canvas-confetti/')) {
            return 'vendor-confetti'
          }
          return undefined
        },
      },
    },
  },
})
