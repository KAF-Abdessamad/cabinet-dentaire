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

export default api;
