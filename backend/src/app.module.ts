import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Record } from './records/entities/record.entity';
import { RecordsModule } from './records/records.module';
import { EtlModule } from './etl/etl.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        /**
         * CONFIGURACIÓN DE BASE DE DATOS (MySQL)
         * ---------------------------------------------------
         * Se establece la conexión utilizando TypeORM.
         * 'synchronize: true' se usa solo en desarrollo para crear tablas automáticamente.
         */
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: 'Admin12345',
            database: 'zizcar_db',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
        }),

        /**
         * REGISTRO DE MÓDULOS DE LA APLICACIÓN
         * ---------------------------------------------------
         * Aquí se importan los dominios funcionales del sistema.
         */
        RecordsModule, // Gestión de registros financieros
        EtlModule,     // Proceso de Extracción, Transformación y Carga
        AuthModule,    // Autenticación y JWT
        UsersModule,   // Gestión de usuarios y permisos

        TypeOrmModule.forFeature([Record]),
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
