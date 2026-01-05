import { defineStore } from 'pinia';
import api from '../services/api';
import { jwtDecode } from "jwt-decode";
import router from '../router';

/**
 * Store de Autenticación (Pinia).
 * 
 * Responsabilidades:
 * - Gestionar el estado de la sesión (Token y Usuario).
 * - Proveer acciones para Login y Logout.
 * - Persistir el token en LocalStorage.
 */
export const useAuthStore = defineStore('auth', {
    state: () => {
        const token = localStorage.getItem('token');
        let user: any = null;

        // Intenta recuperar el usuario del token almacenado
        if (token) {
            try {
                user = jwtDecode(token);
            } catch (error) {
                console.error('Token inválido en storage, limpiando...');
                localStorage.removeItem('token');
            }
        }
        return {
            token,
            user,
        };
    },
    getters: {
        /**
         * Verifica si existe una sesión activa.
         * @returns {boolean} True si hay token válido.
         */
        isAuthenticated: (state) => !!state.token,
    },
    actions: {
        /**
         * Inicia sesión contra el backend.
         * 
         * @param username - Correo del usuario.
         * @param pass - Contraseña plana.
         * @throws Error si las credenciales son inválidas.
         */
        async login(username: string, pass: string) {
            try {
                const response = await api.post('/auth/login', { username, password: pass });
                this.token = response.data.access_token;

                if (this.token) {
                    localStorage.setItem('token', this.token);
                    this.user = jwtDecode(this.token);
                }

                router.push('/records');
            } catch (error) {
                console.error('Fallo en login:', error);
                throw error;
            }
        },

        /**
         * Cierra la sesión actual.
         * Limpia el estado y el almacenamiento local, luego redirige.
         */
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
            router.push('/login');
        },
    },
});
