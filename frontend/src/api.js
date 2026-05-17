import axios from 'axios';

// Configuration Axios avec proxy Vite (dev) ou direct (prod sur port 8000)
const api = axios.create({
    baseURL: '/', // Utilise le même domaine/port que l'application
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Intercepteur pour gérer les erreurs 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Ne pas rediriger si c'est la route /api/user (vérification d'auth)
            if (error.config?.url === '/api/user') {
                return Promise.reject(error);
            }
            // Rediriger vers login si non authentifié
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
