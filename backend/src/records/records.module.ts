import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from './entities/record.entity';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { EtlModule } from '../etl/etl.module';

@Module({
    imports: [TypeOrmModule.forFeature([Record]), EtlModule],
    controllers: [RecordsController],
    providers: [RecordsService],
    exports: [TypeOrmModule, RecordsService],
})
export class RecordsModule { }
