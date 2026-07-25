import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class ProductVariantDto {
  @ApiProperty({ example: 'clx0000000000000000unitid' })
  @IsString()
  @IsNotEmpty()
  unitId: string;

  @ApiProperty({ example: '1 kg Pack', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'AMUL-MILK-1KG' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 120 })
  @IsNumber()
  @IsPositive()
  mrp: number;

  @ApiProperty({ example: 108 })
  @IsNumber()
  @IsPositive()
  sellingPrice: number;

  @ApiProperty({ example: 10, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number = 0;

  @ApiProperty({ example: '8901030123456', required: false })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ default: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean = false;
}
