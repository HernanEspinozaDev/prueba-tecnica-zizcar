import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

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

    await app.listen(3000);
}
bootstrap();
