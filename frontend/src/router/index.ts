import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Records from '../views/Records.vue';

/**
 * Configuración del Enrutador (Vue Router).
 * Define las rutas de la aplicación y protege el acceso mediante guardias de navegación.
 */
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: Login,
            meta: { description: 'Página de inicio de sesión' }
        },
        {
            path: '/records',
            name: 'records',
            component: Records,
            meta: { requiresAuth: true, description: 'Listado de registros financieros' },
        },
        {
            path: '/',
            redirect: '/records',
        },
    ],
});

/**
 * Guardia de Navegación Global (Global Navigation Guard).
 * 
 * Propósito:
 * - Verificar si el usuario tiene un token antes de acceder a rutas protegidas.
 * - Redirigir al login si no está autenticado.
 */
router.beforeEach((to, _from, next) => {
    const token = localStorage.getItem('token');

    // Si la ruta requiere autenticación y no hay token, redirigir a Login
    if (to.meta.requiresAuth && !token) {
        next('/login');
    } else {
        next();
    }
});

export default router;
