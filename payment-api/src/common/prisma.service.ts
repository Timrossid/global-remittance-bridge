import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async $connect() {
    try {
      await super.$connect();
      console.log('[prisma] Connected to database');
    } catch (error) {
      console.error('[prisma] Failed to connect to database:', error);
      throw error;
    }
  }

  async $disconnect() {
    try {
      await super.$disconnect();
      console.log('[prisma] Disconnected from database');
    } catch (error) {
      console.error('[prisma] Error during disconnect:', error);
    }
  }

  async healthCheck() {
    try {
      await this.$queryRaw`SELECT 1`;
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
