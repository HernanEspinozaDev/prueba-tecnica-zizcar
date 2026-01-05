/**
 * Interfaz que define la estructura de un Registro Financiero.
 * Utilizada en toda la aplicación para tipado estricto.
 */
export interface Record {
    /** ID único interno de la base de datos */
    id: number;
    /** Identificador de negocio (ej: INV-2026-001) */
    sourceId: string;
    /** Fecha de la transacción (ISO Date) */
    date: string;
    /** Categoría del registro (Servicios, Ventas, etc.) */
    category: string;
    /** Monto monetario de la transacción */
    amount: number;
    /** Estado del registro (pendiente, completado, etc.) */
    status: string;
    /** Descripción detallada o notas adicionales */
    description: string;
}
