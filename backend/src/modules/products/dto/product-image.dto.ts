import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class ProductImageDto {
  @ApiProperty({ example: 'https://cdn.nimadkirana.com/products/milk-1.png' })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiProperty({ default: false, required: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean = false;

  @ApiProperty({ default: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number = 0;
}
