// src/api.js
import axios from 'axios';
import { API } from './config';

// "/api" sin barra final
const BASE_URL = (API || '/api').replace(/\/$/, '');

const api = axios.create({
    baseURL: BASE_URL,   // => "/api"
    withCredentials: false,
});

// Token + NORMALIZADOR de URL
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    let url = config.url || '';

    // No tocar si es absoluta
    if (/^https?:\/\//i.test(url)) return config;

    // Evita "/api/api/..." si alguien pasa "/api/..." al cliente con baseURL "/api"
    if (BASE_URL.endsWith('/api') && url.startsWith('/api/')) {
        url = url.replace(/^\/api\//, '/');
    }

    // Colapsa dobles barras iniciales ("/api//xxx" -> "/api/xxx")
    url = url.replace(/^\/{2,}/, '/');

    // Asegura que empieza por "/"
    if (!url.startsWith('/')) url = '/' + url;

    config.url = url;
    return config;
});

export default api;
