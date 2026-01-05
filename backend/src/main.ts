import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/**
 * PUNTO DE ENTRADA DE LA APLICACIÓN
 * ----------------------------------------------------------------------
 * Este archivo es responsable de iniciar el servidor NestJS.
 * - Crea la instancia de la aplicación.
 * - Habilita CORS para permitir peticiones desde el Frontend.
 * - Escucha en el puerto 3000.
 */
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Habilitar CORS para comunicación con Frontend (Vue.js)
    app.enableCors();

    // Configuración de Swagger
    const config = new DocumentBuilder()
        .setTitle('Zizcar API')
        .setDescription('API para la gestión de registros financieros y proceso ETL')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.listen(3000);
}
bootstrap();
