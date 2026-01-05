import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record } from '../records/entities/record.entity';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf = require('pdf-parse');

@Injectable()
export class EtlService {
    private readonly logger = new Logger(EtlService.name);

    constructor(
        @InjectRepository(Record)
        private recordsRepository: Repository<Record>,
    ) { }

    async processEtl() {
        this.logger.log('🚀 Iniciando proceso ETL...');

        /**
         * 1. FASE DE EXTRACCIÓN (EXTRACT)
         * ---------------------------------------------------
         * Se localiza y lee el archivo PDF 'data.pdf'.
         * Se extraen las líneas de texto crudo.
         */
        const rawData = await this.extractData();

        if (rawData.length === 0) {
            this.logger.warn('⚠️ No se encontraron registros válidos en el PDF.');
            return { message: 'No records found', count: 0 };
        }

        /**
         * 2. FASE DE TRANSFORMACIÓN (NORMALIZE)
         * ---------------------------------------------------
         * Se aplican reglas de negocio para limpiar los datos:
         * - Fechas a formato ISO (YYYY-MM-DD).
         * - Montos numéricos (sin símbolos).
         * - Estandarización de estados.
         */
        const normalizedData = this.normalizeData(rawData);

        /**
         * GENERACIÓN DE ARCHIVOS DE AUDITORÍA
         * ---------------------------------------------------
         * Se guardan copias de los datos en disco para validación.
         * - raw.json / raw.csv: Datos originales.
         * - normalized.json / normalized.csv: Datos procesados.
         */
        const outputDir = path.join(__dirname, '..', '..', 'generated');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        // Guardado de archivos Raw
        const rawJsonPath = path.join(outputDir, 'raw.json');
        fs.writeFileSync(rawJsonPath, JSON.stringify(rawData, null, 2));

        const rawCsvPath = path.join(outputDir, 'raw.csv');
        fs.writeFileSync(rawCsvPath, 'raw_line\n' + rawData.join('\n'));

        // Guardado de archivos Normalizados
        const normJsonPath = path.join(outputDir, 'normalized.json');
        fs.writeFileSync(normJsonPath, JSON.stringify(normalizedData, null, 2));

        const headers = 'sourceId,date,category,amount,status,description';
        const rows = normalizedData.map(r =>
            `${r.sourceId},${r.date},${r.category},${r.amount},${r.status},"${r.description}"`
        ).join('\n');
        const normCsvPath = path.join(outputDir, 'normalized.csv');
        fs.writeFileSync(normCsvPath, headers + '\n' + rows);

        this.logger.log(`📄 Archivos de auditoría generados en: ${outputDir}`);


        /**
         * 3. FASE DE CARGA (LOAD)
         * ---------------------------------------------------
         * Se persisten los datos en la base de datos MySQL.
         * Se utiliza 'upsert' para evitar duplicados (idempotencia).
         */
        await this.loadData(normalizedData);

        this.logger.log(`✅ ETL Finalizado. Procesados ${normalizedData.length} registros.`);
        return { message: 'ETL Processed successfully', count: normalizedData.length };
    }

    private async extractData(): Promise<string[]> {
        /**
         * LÓGICA DE BÚSQUEDA DE ARCHIVO
         * ---------------------------------------------------
         * Busca 'data.pdf' inteligentemente subiendo niveles de directorio
         * hasta encontrar el archivo.
         */
        let currentDir = __dirname;
        let filePath = '';
        let found = false;

        // Bucle de búsqueda ascendente (hasta 5 niveles)
        for (let i = 0; i < 5; i++) {
            const checkPath = path.join(currentDir, 'data', 'data.pdf');
            const checkPathSibling = path.join(currentDir, '..', 'data', 'data.pdf');

            if (fs.existsSync(checkPath)) {
                filePath = checkPath;
                found = true;
                break;
            }
            if (fs.existsSync(checkPathSibling)) {
                filePath = checkPathSibling;
                found = true;
                break;
            }
            currentDir = path.join(currentDir, '..');
        }

        // Fallback para ruta específica en caso de fallo en búsqueda dinámica
        if (!found) {
            const hardcodedPath = path.join('c:', 'Users', 'herna', 'OneDrive', 'Documentos', 'practica2026', 'prueba-tecnica-zizcar', 'data', 'data.pdf');
            if (fs.existsSync(hardcodedPath)) {
                filePath = hardcodedPath;
                found = true;
            }
        }

        this.logger.log(`🔍 Buscando archivo PDF... Resultado: ${found ? filePath : 'NO ENCONTRADO'}`);

        if (!found) {
            this.logger.error(`❌ No se pudo encontrar data/data.pdf`);
            throw new NotFoundException('Archivo PDF no encontrado en ninguna ruta esperada.');
        }

        const dataBuffer = fs.readFileSync(filePath);

        try {
            const data = await pdf(dataBuffer);
            const text = data.text;

            // Filtrado de líneas vacías
            const lines = text.split('\n').filter(line => line.trim() !== '');

            // Filtrado por identificador de factura (INV-)
            const recordLines = lines.filter(line => line.includes('INV-'));

            this.logger.log(`📄 Líneas brutas extraídas: ${recordLines.length}`);
            return recordLines;
        } catch (error) {
            this.logger.error('❌ Error parseando el PDF', error);
            throw error;
        }
    }

    private normalizeData(lines: string[]): Partial<Record>[] {
        const records: Partial<Record>[] = [];

        /**
         * EXPRESIÓN REGULAR DE PARSEO
         * ---------------------------------------------------
         * Captura grupos: 
         * 1. ID (INV-...)
         * 2. Fecha (DD-MM-YYYY)
         * 3. Categoría
         * 4. Monto (con $)
         * 5. Estado (pendiente|activo...)
         * 6. Descripción
         */
        const regex = /(INV-\d{4}-\d{3})\s*(\d{2}-\d{2}-\d{4})\s*(\w+)\s*(\$[\d\.]+)\s*(pendiente|activo|cancelado|completado)\s*(.+)/i;

        for (const line of lines) {
            const cleanLine = line.trim();
            const match = cleanLine.match(regex);

            if (match) {
                try {
                    const [_, sourceId, rawDate, category, rawAmount, status, description] = match;

                    // Normalización de Fecha (ISO 8601)
                    const [day, month, year] = rawDate.split('-');
                    const date = `${year}-${month}-${day}`;

                    // Normalización de Monto (Decimal)
                    const amount = parseFloat(rawAmount.replace(/\./g, '').replace('$', ''));

                    records.push({
                        sourceId,
                        date,
                        category: category.trim(),
                        amount,
                        status: status.trim().toLowerCase().replace(/\.$/, ''),
                        description: description.trim()
                    });
                } catch (e) {
                    this.logger.warn(`⚠️ Error normalizando línea: ${line}`, e);
                }
            } else {
                if (records.length === 0 && lines.indexOf(line) < 5) {
                    this.logger.warn(`❌ Regex failed for line: '${cleanLine}'`);
                }
            }
        }

        return records;
    }

    private async loadData(records: Partial<Record>[]) {
        /**
         * PERSISTENCIA DE DATOS
         * ---------------------------------------------------
         * Guarda en lote usando 'upsert' para garantizar que si un registro
         * ya existe (por sourceId), se actualice en lugar de duplicarse.
         */
        if (records.length > 0) {
            await this.recordsRepository.upsert(records, ['sourceId']);
            this.logger.log(`💾 Guardados ${records.length} registros en base de datos.`);
        }
    }
}
