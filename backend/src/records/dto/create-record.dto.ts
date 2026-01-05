import { ApiProperty } from '@nestjs/swagger';

export class CreateRecordDto {
    @ApiProperty({ example: 'INV-2026-001', description: 'ID único del registro (formato INV-YYYY-XXX)' })
    sourceId: string;

    @ApiProperty({ example: '2026-01-05', description: 'Fecha del registro (YYYY-MM-DD)' })
    date: string;

    @ApiProperty({ example: 'Servicios', description: 'Categoría del registro', enum: ['Servicios', 'Inventario', 'Gastos', 'Ventas'] })
    category: string;

    @ApiProperty({ example: 150000, description: 'Monto de la transacción' })
    amount: number;

    @ApiProperty({ example: 'pendiente', description: 'Estado del registro', enum: ['pendiente', 'completado', 'cancelado', 'activo'] })
    status: string;

    @ApiProperty({ example: 'Pago por servicios de consultoría', description: 'Descripción detallada', required: false })
    description?: string;
}
