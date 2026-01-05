import { Controller, Post } from '@nestjs/common';
import { EtlService } from './etl.service';

@Controller('etl')
export class EtlController {
    constructor(private readonly etlService: EtlService) { }

    @Post('process')
    async process() {
        return this.etlService.processEtl();
    }
}
