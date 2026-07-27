import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(params: {
    adminId: string;
    action: string;
    targetTable?: string;
    targetId?: string;
    previousValue?: unknown;
    newValue?: unknown;
    ipAddress?: string;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          adminId: params.adminId,
          action: params.action,
          targetTable: params.targetTable,
          targetId: params.targetId,
          previousValue: params.previousValue ? JSON.stringify(params.previousValue) : null,
          newValue: params.newValue ? JSON.stringify(params.newValue) : null,
          ipAddress: params.ipAddress,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to write audit log: ${err}`);
    }
  }
}