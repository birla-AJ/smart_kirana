import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRoleType } from '@prisma/client';

export class CreateRoleDto {
  @ApiProperty({ enum: UserRoleType, example: UserRoleType.ADMIN })
  @IsEnum(UserRoleType)
  name: UserRoleType;

  @ApiProperty({ example: 'Store operations access', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
