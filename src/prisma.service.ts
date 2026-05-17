import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
    } catch (error) {
      this.logger.warn(
        'Não foi possível conectar ao banco no boot. A API subiu, mas endpoints de dados vão falhar até o banco ficar acessível.',
      );
      this.logger.debug(String(error));
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
