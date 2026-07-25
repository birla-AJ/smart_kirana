import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsString } from 'class-validator';

export class AssignPermissionsDto {
  @ApiProperty({
    type: [String],
    example: ['products.create', 'products.update'],
    description: 'Permission names to assign to this role (replaces the existing set)',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  permissionNames: string[];
}
