import { Injectable, Logger } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { QueryAuditLogDto } from '../dto/query-audit-log.dto';
import { buildPaginatedResponse } from '../../../common/utils/paginate.util';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { AuditLogEntity } from '../entities/audit-log.entity';

export interface AuditLogInput {
  userId?: string;
  action: AuditAction;
  module: string;
  recordId?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  oldData?: unknown;
  newData?: unknown;
}

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Fire-and-forget write — a logging failure must never break the request it's auditing. */
  async log(input: AuditLogInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: input.userId,
          action: input.action,
          module: input.module,
          recordId: input.recordId,
          description: input.description,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          oldData: input.oldData as Prisma.InputJsonValue,
          newData: input.newData as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      this.logger.error('Failed to write audit log entry', error as Error);
    }
  }

  async findAll(query: QueryAuditLogDto): Promise<PaginatedResponseDto<AuditLogEntity>> {
    const where = {
      ...(query.action ? { action: query.action } : {}),
      ...(query.module ? { module: query.module } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
    };

    const [data, totalItems] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return buildPaginatedResponse(data, totalItems, query.page ?? 1, query.take);
  }
}
