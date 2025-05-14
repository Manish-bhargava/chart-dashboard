<<<<<<< HEAD
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
=======
// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  console.log('Current mode:', mode);
  console.log('API URL:', env.VITE_API_URL || 'https://mhbodhi.medtalent.co/api');
  
  const proxyConfig = {
    target: 'https://mhbodhi.medtalent.co',
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path.replace(/^\/api/, '/api'),
    configure: (proxy, options) => {
      proxy.on('error', (err, req, res) => {
        console.error('Proxy Error:', err);
      });

      proxy.on('proxyReq', (proxyReq, req, res) => {
        // Log the outgoing request
        console.log('Outgoing request:', {
          method: proxyReq.method,
          path: proxyReq.path,
          headers: proxyReq.getHeaders()
        });

        // Set the origin to match the target
        proxyReq.setHeader('origin', 'https://mhbodhi.medtalent.co');
        
        // Handle preflight
        if (req.method === 'OPTIONS') {
          proxyReq.setHeader('access-control-request-method', 'POST');
          proxyReq.setHeader('access-control-request-headers', 'content-type,accept');
        }
      });

      proxy.on('proxyRes', (proxyRes, req, res) => {
        // Log the response
        console.log('Response:', {
          statusCode: proxyRes.statusCode,
          headers: proxyRes.headers
        });
      });
    }
  };

>>>>>>> 48e6ff0 (resolve cors iisue)
  return {
    plugins: [react()],
    resolve: {
      alias: {
<<<<<<< HEAD
        '@': resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'https://mhbodhi.medtalent.co/api',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
=======
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 4174,
      proxy: {
        '/api': proxyConfig
      },
    },
    preview: {
      port: 4175,
      host: true,
      strictPort: true,
      proxy: {
        '/api': proxyConfig
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: false,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
>>>>>>> 48e6ff0 (resolve cors iisue)
        },
      },
    },
  };
});
