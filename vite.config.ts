import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  assetsInclude: ['**/*.PNG', '**/*.png'], // Include PNG files
  build: {
    sourcemap: true, // Enable source maps for debugging
    target: 'esnext', // Target modern browsers
    chunkSizeWarningLimit: 1000, // Increase warning limit for larger chunks
  },
  server: {
    port: 3000, // Set development server port
    open: true, // Automatically open in browser
  }
})