import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { validateEnv } from './common/utils/env.util';

validateEnv();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : '*';

  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Correlation-ID',
      'X-API-Key',
      'Idempotency-Key',
    ],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', async (_req: any, res: any) => {
    const prisma = app.get('PrismaService');
    const dbHealth = await prisma.healthCheck();
    res.status(200).json({
      status: dbHealth.status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbHealth,
    });
  });

  const port = parseInt(process.env.PORT ?? '3001', 10);
  const server = await app.listen(port, '0.0.0.0');
  console.log(`Payment API running on port ${port}`);

  const gracefulShutdown = async (signal: string) => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    await app.close();
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

bootstrap();
