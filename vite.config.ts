import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      // Only use vueDevTools in development mode
      mode === 'development' ? vueDevTools() : null,
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    assetsInclude: ['**/*.PNG', '**/*.png', '**/*.svg'], // Include PNG and SVG files
    build: {
      // Configure rollup options
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'vue-router', 'pinia'],
            'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/functions', 'firebase/storage'],
            'payment': ['@stripe/stripe-js', '@vue-stripe/vue-stripe', '@paypal/paypal-js']
          }
        }
      },
      sourcemap: true, // Enable source maps for debugging
      target: 'esnext', // Target modern browsers
      chunkSizeWarningLimit: 1000, // Increase warning limit for larger chunks
    },
    // Set base URL for deployment
    base: '/',
    // Optimize dependencies
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', 'firebase/app', '@stripe/stripe-js']
    },
    server: {
      port: 3000, // Set development server port
      open: true, // Automatically open in browser
    }
  }
})