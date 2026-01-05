import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from './entities/record.entity';
import { RecordsController } from './records.controller';
import { EtlModule } from '../etl/etl.module';

@Module({
    imports: [TypeOrmModule.forFeature([Record]), EtlModule],
    controllers: [RecordsController],
    exports: [TypeOrmModule],
})
export class RecordsModule { }
