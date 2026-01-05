import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record } from './entities/record.entity';

import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

@Injectable()
export class RecordsService {
    constructor(
        @InjectRepository(Record)
        private recordsRepository: Repository<Record>,
    ) { }

    /**
     * Obtiene todos los registros ordenados por fecha descendente.
     * 
     * @returns {Promise<Record[]>} Lista de todos los registros.
     */
    findAll() {
        return this.recordsRepository.find({ order: { date: 'DESC' } });
    }

    /**
     * Crea un nuevo registro en la base de datos.
     * 
     * @param {CreateRecordDto} createRecordDto - Datos del registro a crear.
     * @returns {Promise<Record>} El registro creado.
     */
    async create(createRecordDto: CreateRecordDto) {
        const record = this.recordsRepository.create(createRecordDto);
        return await this.recordsRepository.save(record);
    }

    /**
     * Actualiza un registro existente basado en su ID.
     * 
     * @param {number} id - ID numérico del registro a actualizar.
     * @param {UpdateRecordDto} updateRecordDto - Datos a modificar.
     * @returns {Promise<Record | null>} El registro actualizado.
     */
    async update(id: number, updateRecordDto: UpdateRecordDto) {
        await this.recordsRepository.update(id, updateRecordDto);
        return this.recordsRepository.findOneBy({ id });
    }

    /**
     * Elimina un registro de la base de datos.
     * 
     * @param {number} id - ID del registro a eliminar.
     * @returns {object} Objeto confirmando la eliminación.
     */
    async remove(id: number) {
        await this.recordsRepository.delete(id);
        return { deleted: true };
    }
}
