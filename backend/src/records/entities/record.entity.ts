import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * ENTIDAD: RECORD (Registros Financieros)
 * ---------------------------------------------------
 * Representa la tabla 'records' en la base de datos.
 * Almacena la información extraída y normalizada del PDF.
 */
@Entity('records')
export class Record {
    @PrimaryGeneratedColumn()
    id: number;

    // ID único proveniente del documento original (usado para idempotencia)
    @Column({ unique: true })
    sourceId: string;

    @Column({ type: 'date' })
    date: string;

    @Column()
    category: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column()
    status: string;

    @Column({ type: 'text', nullable: true })
    description: string;
}
