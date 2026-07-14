import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Entry point for the Payment API service.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow requests from any origin (tighten in production with an allowlist)
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Simple health check — required by Railway / Render health check probes
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req: any, res: any) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Railway and Render inject PORT via env; default to 3001 for local dev
  const port = parseInt(process.env.PORT ?? '3001', 10);
  await app.listen(port, '0.0.0.0');
  console.log(`Payment API running on port ${port}`);
}

bootstrap();
