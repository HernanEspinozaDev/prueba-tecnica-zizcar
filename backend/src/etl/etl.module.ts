import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from '../records/entities/record.entity';
import { EtlService } from './etl.service';

import { EtlController } from './etl.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Record])],
    controllers: [EtlController],
    providers: [EtlService],
    exports: [EtlService],
})
export class EtlModule { }
