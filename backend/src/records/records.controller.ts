import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Record } from './entities/record.entity';
import { Repository } from 'typeorm';
import { AuthGuard } from '@nestjs/passport';

@Controller('records')
export class RecordsController {
    constructor(
        @InjectRepository(Record)
        private recordsRepository: Repository<Record>,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async findAll() {
        return this.recordsRepository.find();
    }


}
