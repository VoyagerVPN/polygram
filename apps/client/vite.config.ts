import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  css: {
    // PostCSS is required for Tailwind 3 compatibility
    // lightningcss minification is still enabled below in build.cssMinify
  },
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    process.env.HTTPS && mkcert(),
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    cssMinify: 'lightningcss',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Check if this is a node_modules dependency
          if (id.includes('node_modules')) {
            // Animation library (heavy, separate chunk)
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            // Router
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // State management
            if (id.includes('zustand')) {
              return 'vendor-state';
            }
            // TON Connect (heavy)
            if (id.includes('@tonconnect')) {
              return 'vendor-tonconnect';
            }
            // React ecosystem (must be together)
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/scheduler/') ||
              id.includes('@telegram-apps')
            ) {
              return 'vendor-core';
            }
          }
          // Charts loaded via React.lazy automatically creates separate chunk
        },
      },
    },
  },
  future: {
    // Enable Vite 7 future breaking changes for better diagnostics
    // (Actual list depends on the specific Vite 7 version)
  },
  publicDir: './public',
  server: {
    host: true,
  },
});
