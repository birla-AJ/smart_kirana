import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({ example: 'clx0000000000000000roleid' })
  @IsString()
  @IsNotEmpty()
  roleId: string;
}
