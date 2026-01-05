import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * Store de Notificaciones Globales.
 * 
 * Gestiona el estado de los "snackbars" (alertas flotantes) de la aplicación.
 * Permite mostrar mensajes de éxito, error o información desde cualquier componente.
 */
export const useNotificationStore = defineStore('notifications', () => {
    // Estado reactivo del snackbar
    const show = ref(false);
    const text = ref('');
    const color = ref('success');
    const icon = ref('mdi-check-circle');

    /**
     * Muestra una nueva notificación.
     * 
     * @param message - Texto a mostrar.
     * @param type - Tipo de alerta visual ('success' | 'error' | 'info').
     */
    const showMessage = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        text.value = message;
        color.value = type === 'error' ? 'red-accent-4' : (type === 'info' ? 'blue-darken-2' : 'green-darken-2');
        icon.value = type === 'error' ? 'mdi-alert-circle' : (type === 'info' ? 'mdi-information' : 'mdi-check-circle');
        show.value = true;
    };

    return { show, text, color, icon, showMessage };
});
