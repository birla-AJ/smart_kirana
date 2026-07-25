import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { AuditLogsService } from '../services/audit-logs.service';
import { QueryAuditLogDto } from '../dto/query-audit-log.dto';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Audit Log')
@ApiBearerAuth('access-token')
@Roles(UserRoleType.SUPER_ADMIN)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List audit trail entries (SUPER_ADMIN only)' })
  async findAll(@Query() query: QueryAuditLogDto) {
    const data = await this.auditLogsService.findAll(query);
    return { message: 'Audit logs fetched successfully', data };
  }
}
