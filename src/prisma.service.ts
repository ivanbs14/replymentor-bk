import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { OperationalLogger } from './observability/operational-logger';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new OperationalLogger();

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
    } catch {
      this.logger.warn({
        event: 'database_connection',
        outcome: 'unavailable',
        errorCode: 'DATABASE_UNAVAILABLE',
      });
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
