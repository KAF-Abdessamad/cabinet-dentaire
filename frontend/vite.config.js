import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Laravel doit écouter sur ce port (ex. `php artisan serve` → 8000 par défaut).
// Si besoin : créer `frontend/.env.local` avec VITE_API_PROXY_TARGET=http://127.0.0.1:8080
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const apiTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000';

    return {
    plugins: [react()],
    // SPA patient served at domain root in prod (Laravel).
    server: {
        port: 5174,
        strictPort: true,
        proxy: {
            '/api': {
                target: apiTarget,
                changeOrigin: true,
                secure: false,
            },
            '/sanctum': {
                target: apiTarget,
                changeOrigin: true,
                secure: false,
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
};
});
