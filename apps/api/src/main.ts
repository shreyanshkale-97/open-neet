import { NestFactory } from '@nestjs/core';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // ── Global prefix & API versioning ──────────────────────────────────────
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ── CORS ────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env['FRONTEND_URL'] ?? 'http://localhost:5173',
    credentials: true,
  });

  // ── Global Validation Pipe ───────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,           // auto-transform types
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  const port = process.env['API_PORT'] ?? 3001;
  await app.listen(port);
  console.log(`🚀 NEET AI API running at: http://localhost:${port}/api/v1/health`);
}

bootstrap();