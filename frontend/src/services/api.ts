import axios from 'axios';

/**
 * Instancia global de Axios pre-configurada.
 * Se conecta al backend en localhost:3000 por defecto.
 */
const api = axios.create({
    baseURL: 'http://localhost:3000',
});

/**
 * Interceptor de Solicitud (Request Interceptor).
 * 
 * Propósito:
 * - Inyectar automáticamente el Token JWT en los headers.
 * - Asegura que todas las peticiones privadas estén autenticadas.
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Interceptor de Respuesta (Response Interceptor).
 * 
 * Propósito:
 * - Manejar globalmente errores de autenticación (401).
 * - Redirigir al usuario al login si su sesión expiró o es inválida.
 * - Evita bucles infinitos excluyendo la ruta de '/auth/login'.
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Solo redirigir si NO es un intento de login fallido
            if (!error.config.url.includes('/auth/login')) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
