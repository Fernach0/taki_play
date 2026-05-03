import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir archivos estáticos desde /public (MP3, imágenes, etc.)
  app.useStaticAssets(join(__dirname, '..', '..', 'public'));

  // Prefijo global para la API
  app.setGlobalPrefix('api/v1');

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({ origin: '*' });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\n🎵 Taki Play Backend corriendo en: http://localhost:${port}/api/v1`);
  console.log(`📁 Archivos estáticos en:          http://localhost:${port}/media/`);
}

bootstrap();
