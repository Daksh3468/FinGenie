import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        timeout: 600000,
        proxyTimeout: 600000,
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    testTimeout: 10000,
    css: false,          // ← prevents CSS import crashes (ExportSuite, etc.)
    include: ['src/tests/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'],
      include: ['src/components/**'],
      exclude: ['src/main.jsx', 'src/tests/**'],
      thresholds: { lines: 100, functions: 100, branches: 100 },
    },
  },
})
