import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env['NODE_ENV'] === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to PostgreSQL database via Prisma');
    } catch (err) {
      this.logger.warn(`Prisma DB connection deferred (${err instanceof Error ? err.message : 'Unknown error'}). Verify DATABASE_URL password in .env.`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}