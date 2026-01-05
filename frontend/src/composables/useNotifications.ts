import { useNotificationStore } from '../stores/notifications';

/**
 * Composable para gestionar notificaciones globales.
 * Facilita el acceso al store de notificaciones desde cualquier componente.
 */
export function useNotifications() {
    const store = useNotificationStore();

    return {
        store,
        showMessage: store.showMessage,
        showSuccess: (msg: string) => store.showMessage(msg, 'success'),
        showError: (msg: string) => store.showMessage(msg, 'error'),
        showInfo: (msg: string) => store.showMessage(msg, 'info'),
    };
}
