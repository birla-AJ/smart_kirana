import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'products.create', description: 'Unique permission key: "<module>.<action>"' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+\.[a-z0-9_]+$/, {
    message: 'name must be in the format "<module>.<action>", e.g. "products.create"',
  })
  name: string;

  @ApiProperty({ example: 'products' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  module: string;

  @ApiProperty({ example: 'create' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  action: string;

  @ApiProperty({ example: 'Allows creating new products', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
