import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Records')
@ApiBearerAuth()
@Controller('records')
export class RecordsController {
    constructor(private readonly recordsService: RecordsService) { }

    /**
     * GET /records
     * 
     * Recupera el listado completo de registros.
     * Requiere autenticación JWT.
     */
    @UseGuards(AuthGuard('jwt'))
    @Get()
    @ApiOperation({ summary: 'Obtener todos los registros', description: 'Retorna una lista de registros ordenados por fecha descendente.' })
    @ApiResponse({ status: 200, description: 'Lista de registros recuperada con éxito.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    findAll() {
        return this.recordsService.findAll();
    }

    /**
     * POST /records
     * 
     * Crea un nuevo registro manualmente.
     * @param createRecordDto Cuerpo de la petición con los datos del registro.
     */
    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Crear un nuevo registro', description: 'Crea un registro financiero válido en la base de datos.' })
    @ApiResponse({ status: 201, description: 'Registro creado exitosamente.' })
    @ApiResponse({ status: 400, description: 'Datos inválidos.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    create(@Body() createRecordDto: CreateRecordDto) {
        return this.recordsService.create(createRecordDto);
    }

    /**
     * PUT /records/:id
     * 
     * Actualiza un registro existente.
     * @param id ID del registro a editar.
     * @param updateRecordDto Datos nuevos para el registro.
     */
    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un registro', description: 'Modifica los datos de un registro existente por su ID.' })
    @ApiResponse({ status: 200, description: 'Registro actualizado correctamente.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    update(@Param('id') id: string, @Body() updateRecordDto: UpdateRecordDto) {
        return this.recordsService.update(+id, updateRecordDto);
    }

    /**
     * DELETE /records/:id
     * 
     * Elimina un registro permanentemente.
     * @param id ID del registro a eliminar.
     */
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un registro', description: 'Elimina permanentemente un registro de la base de datos.' })
    @ApiResponse({ status: 200, description: 'Registro eliminado correctamente.' })
    @ApiResponse({ status: 404, description: 'Registro no encontrado.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    remove(@Param('id') id: string) {
        return this.recordsService.remove(+id);
    }
}
