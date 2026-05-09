import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // SPA patient served at domain root in prod (Laravel).
    server: {
        port: 5174,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            '/sanctum': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
            // Note: /login, /register, /logout are handled by the React SPA
            // The API calls to these are already under /api/...
        },
    },
    build: {
        // Build output is served by Laravel from backend/public
        outDir: '../backend/public',
        assetsDir: 'patient-assets',
        emptyOutDir: false,
    },
});
