import { ApiProperty } from '@nestjs/swagger';
import { AuditAction } from '@prisma/client';

export class AuditLogEntity {
  @ApiProperty({ nullable: true }) userId: string | null;
  @ApiProperty({ enum: AuditAction }) action: AuditAction;
  @ApiProperty() module: string;
  @ApiProperty({ nullable: true }) recordId: string | null;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty({ nullable: true }) ipAddress: string | null;
  @ApiProperty() createdAt: Date;
}
