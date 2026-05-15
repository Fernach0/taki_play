import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('Iniciando el servidor NestJS...');

  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useStaticAssets(join(__dirname, '..', 'public'));

    app.setGlobalPrefix('api/v1');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.enableCors({ origin: '*' });

    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');

    console.log(`Servidor corriendo en puerto ${port} (0.0.0.0)`);
    console.log(`API disponible en: http://0.0.0.0:${port}/api/v1`);
  } catch (error) {
    console.error('Error fatal al arrancar la aplicación:', error);
    process.exit(1);
  }
}

bootstrap();
