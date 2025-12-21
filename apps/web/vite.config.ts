import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import viteImagemin from 'vite-plugin-imagemin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer (번들 크기 분석)
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // Gzip compression
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // Only compress files > 10KB
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli compression (better than gzip)
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    // Image optimization
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
          {
            name: 'removeEmptyAttrs',
            active: true,
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development', // Only in dev
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2, // More aggressive minification
      },
      mangle: {
        safari10: true, // Safari 10 compatibility
      },
    },
    rollupOptions: {
      output: {
        // Dynamic chunk splitting based on module size
        manualChunks: (id) => {
          // Core vendors (loaded on every page)
          if (id.includes('/node_modules/')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-core';
            }
            // State management
            if (id.includes('zustand') || id.includes('react-query')) {
              return 'state-management';
            }
            // UI libraries
            if (id.includes('framer-motion') || id.includes('react-icons') || id.includes('react-hot-toast')) {
              return 'ui-libs';
            }
            // Utilities
            if (id.includes('axios') || id.includes('lodash') || id.includes('clsx')) {
              return 'utils';
            }
            // Sentry (only if needed)
            if (id.includes('@sentry')) {
              return 'sentry';
            }
            // Other vendors
            return 'vendor';
          }
          // Split by route/page for code-splitting
          if (id.includes('/src/pages/')) {
            const pageName = id.split('/pages/')[1].split('/')[0];
            return `page-${pageName}`;
          }
        },
        // Asset file naming patterns with cache busting
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          } else if (/css/.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[ext]/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        // Compact output
        compact: true,
        // Modern module format
        format: 'es',
      },
      // External dependencies for CDN (optional)
      // external: ['react', 'react-dom'],
    },
    // Performance optimizations
    chunkSizeWarningLimit: 500, // Warn if chunk > 500KB
    cssCodeSplit: true, // Split CSS into chunks
    assetsInlineLimit: 4096, // Inline assets < 4KB
    reportCompressedSize: false, // Faster builds
    // Minify CSS
    cssMinify: true,
    // Target modern browsers for smaller output
    target: 'es2020',
  },
  // Enable esbuild for faster builds
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    legalComments: 'none',
  },
  // Performance hints
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'axios',
    ],
    exclude: ['@sentry/react'], // Don't pre-bundle large deps
  },
});
