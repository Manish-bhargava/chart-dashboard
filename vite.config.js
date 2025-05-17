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
    secure: true,
    ws: true,
    rewrite: (path) => path.replace(/^\/api/, '/api'),
    configure: (proxy, options) => {
      proxy.on('error', (err, req, res) => {
        console.error('Proxy Error:', err);
        if (res.writeHead && !res.headersSent) {
          res.writeHead(500, {
            'Content-Type': 'application/json',
          });
        }
        const json = { error: err.message };
        res.end(JSON.stringify(json));
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
        proxyReq.setHeader('referer', 'https://mhbodhi.medtalent.co');
        
        // Handle preflight
        if (req.method === 'OPTIONS') {
          if (!res.headersSent) {
            res.statusCode = 200;
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
            res.setHeader('Access-Control-Max-Age', '86400');
            res.end();
          }
          return;
        }
      });

      proxy.on('proxyRes', (proxyRes, req, res) => {
        // Add CORS headers to the response
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept';

        // Log the response
        console.log('Response:', {
          statusCode: proxyRes.statusCode,
          headers: proxyRes.headers
        });
      });
    }
  };

  return {
    base: '/',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 4174,
      cors: true,
      proxy: {
        '/api': proxyConfig,
        '^/reportanalytics/.*': {
          target: 'https://mhbodhi.medtalent.co/api',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        }
      },
    },
    preview: {
      port: 4175,
      host: true,
      strictPort: true,
      cors: true,
      proxy: {
        '/api': proxyConfig,
        '^/reportanalytics/.*': {
          target: 'https://mhbodhi.medtalent.co/api',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        }
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
        },
      },
    },
  };
});
