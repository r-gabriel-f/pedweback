import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación global: aplica los decoradores de class-validator en los DTOs.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina props no declaradas en el DTO
      forbidNonWhitelisted: true, // rechaza si llega una prop extra
      transform: true, // convierte tipos primitivos (ej. string → number)
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Filtro global de excepciones: loguea stack completo y detalle de errores.
  // En desarrollo devuelve el mensaje real; en producción solo genérico.
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configurar CORS — acepta múltiples orígenes separados por coma.
  // Ej: FRONTEND_URL=http://localhost:5173,https://tu-app.netlify.app
  const allowedOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
