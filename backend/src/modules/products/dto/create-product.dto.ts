import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ProductVariantDto } from './product-variant.dto';
import { ProductImageDto } from './product-image.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'clx0000000000000000catid' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subCategoryId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiProperty({ example: 'Amul Taaza Toned Milk' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'SKU-AMUL-MILK', description: 'Base product SKU (variants have their own SKUs too)' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ default: false, required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isVeg?: boolean = true;

  @ApiProperty({ default: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxPercentage?: number = 0;

  @ApiProperty({ type: [ProductVariantDto], description: 'At least one variant is required' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants: ProductVariantDto[];

  @ApiProperty({ type: [ProductImageDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @ApiProperty({ example: 100, default: 0, required: false, description: 'Initial stock quantity' })
  @IsOptional()
  @IsInt()
  @Min(0)
  initialStock?: number = 0;

  @ApiProperty({ example: 10, default: 10, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number = 10;
}
