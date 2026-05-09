import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // SPA patient served at domain root in prod (Laravel).
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            // Allow navigating to Laravel admin while developing on Vite.
            '/admin': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            '/sanctum': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            '/login': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            '/logout': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            '/register': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
    build: {
        // Build output is served by Laravel from backend/public
        outDir: '../backend/public',
        assetsDir: 'patient-assets',
        emptyOutDir: false,
    },
});
