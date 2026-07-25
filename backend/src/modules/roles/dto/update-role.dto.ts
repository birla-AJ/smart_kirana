import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

// A role's `name` maps to a fixed UserRoleType enum used across the schema
// (SUPER_ADMIN/ADMIN/CUSTOMER) and is intentionally not renameable after
// creation — only its description is editable.
export class UpdateRoleDto {
  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
