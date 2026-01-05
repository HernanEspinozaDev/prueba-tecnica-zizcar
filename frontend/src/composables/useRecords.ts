import { ref } from 'vue';
import api from '../services/api';
import type { Record } from '../types/record';
import { useNotifications } from './useNotifications';

/**
 * Composable para la gestión de Registros Financieros.
 * Provee estado reactivo y métodos CRUD.
 */
export function useRecords() {
    const records = ref<Record[]>([]);
    const loading = ref(false);
    const { showError, showSuccess } = useNotifications();

    /**
     * Carga inicial de datos desde el backend.
     */
    const loadRecords = async () => {
        loading.value = true;
        try {
            const response = await api.get<Record[]>('/records');
            records.value = response.data;
        } catch (e) {
            console.error(e);
            showError('Error cargando registros');
        } finally {
            loading.value = false;
        }
    };

    /**
     * Genera el siguiente ID secuencial (INV-YYYY-XXX).
     * @internal - Función de uso interno para la lógica de creación.
     */
    const generateNextId = () => {
        if (records.value.length === 0) return `INV-${new Date().getFullYear()}-001`;

        const regex = /^INV-(\d{4})-(\d+)$/;
        let maxNum = 0;
        let maxYear = new Date().getFullYear();

        records.value.forEach(r => {
            const match = r.sourceId.match(regex);
            if (match) {
                const year = parseInt(match[1] || '0');
                const num = parseInt(match[2] || '0');
                if (year === maxYear) {
                    if (num > maxNum) maxNum = num;
                }
            }
        });

        const nextNum = maxNum + 1;
        const paddedNum = nextNum.toString().padStart(3, '0');
        return `INV-${maxYear}-${paddedNum}`;
    };

    /**
     * Guarda un registro (Crear o Actualizar).
     * @param item Datos del registro.
     * @param isEdit Determina si es una actualización.
     */
    const saveRecord = async (item: Partial<Record>, isEdit: boolean) => {
        loading.value = true;
        try {
            const payload = {
                ...item,
                amount: Number(item.amount)
            };

            if (isEdit && item.id) {
                await api.put(`/records/${item.id}`, payload);
                showSuccess('Registro actualizado correctamente');
            } else {
                await api.post('/records', payload);
                showSuccess('Registro creado exitosamente');
            }
            await loadRecords();
            return true;
        } catch (e: any) {
            console.error(e);
            const msg = e.response?.data?.message || e.message || 'Error Desconocido';
            showError(`Error al guardar: ${msg}`);
            return false;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Elimina un registro por ID.
     */
    const deleteRecord = async (id: number) => {
        loading.value = true;
        try {
            await api.delete(`/records/${id}`);
            await loadRecords();
            showSuccess('Registro eliminado correctamente');
            return true;
        } catch (e) {
            console.error(e);
            showError('Error al eliminar registro');
            return false;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Proceso ETL para importación de PDFs.
     */
    const runEtl = async () => {
        loading.value = true;
        try {
            const res = await api.post('/etl/process');
            const count = res.data.count || 0;
            await loadRecords();
            if (count > 0) {
                showSuccess(`ETL Exitoso: ${count} registros procesados.`);
            } else {
                showSuccess('ETL Finalizado: No hubo cambios nuevos.');
            }
        } catch (e: any) {
            console.error(e);
            const msg = e.response?.data?.message || e.message || 'Error Desconocido';
            showError(`Error en ETL: ${msg}`);
        } finally {
            loading.value = false;
        }
    };

    return {
        records,
        loading,
        loadRecords,
        saveRecord,
        deleteRecord,
        runEtl,
        generateNextId
    };
}
