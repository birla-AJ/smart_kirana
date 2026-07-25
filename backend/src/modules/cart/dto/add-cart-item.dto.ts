import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({ example: 'clx0000000000000000prodid' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'clx0000000000000000varid', required: false, description: 'Defaults to the product\'s default variant' })
  @IsOptional()
  @IsString()
  variantId?: string;

  @ApiProperty({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number = 1;
}
