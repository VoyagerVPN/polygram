import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  css: {
    // PostCSS is required for Tailwind 3 compatibility
    // lightningcss minification is still enabled below in build.cssMinify
  },
  plugins: [
    react(),
    tsconfigPaths(),
    process.env.HTTPS && mkcert(),
  ],
  build: {
    target: 'esnext',
    minify: 'terser',
    cssMinify: 'lightningcss',
    chunkSizeWarningLimit: 1000,
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
