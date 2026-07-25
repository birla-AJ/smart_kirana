import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';

export class ProductImageEntity {
  @ApiProperty() id: string;
  @ApiProperty() imageUrl: string;
  @ApiProperty() isPrimary: boolean;
  @ApiProperty() sortOrder: number;
}

export class ProductVariantEntity {
  @ApiProperty() id: string;
  @ApiProperty({ nullable: true }) name: string | null;
  @ApiProperty() sku: string;
  @ApiProperty() mrp: number;
  @ApiProperty() sellingPrice: number;
  @ApiProperty() discount: number;
  @ApiProperty({ nullable: true }) barcode: string | null;
  @ApiProperty() isDefault: boolean;
  @ApiProperty() unitId: string;
  @ApiProperty() unitName: string;
  @ApiProperty() unitShortName: string;
}

export class ProductInventoryEntity {
  @ApiProperty() totalStock: number;
  @ApiProperty() reservedStock: number;
  @ApiProperty() availableStock: number;
  @ApiProperty() lowStockThreshold: number;
}

export class ProductEntity {
  @ApiProperty() id: string;
  @ApiProperty() categoryId: string;
  @ApiProperty({ nullable: true }) subCategoryId: string | null;
  @ApiProperty({ nullable: true }) brandId: string | null;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiProperty() sku: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty({ enum: ProductStatus }) status: ProductStatus;
  @ApiProperty() isFeatured: boolean;
  @ApiProperty() isVeg: boolean;
  @ApiProperty() taxPercentage: number;
  @ApiProperty({ type: [ProductImageEntity] }) images: ProductImageEntity[];
  @ApiProperty({ type: [ProductVariantEntity] }) variants: ProductVariantEntity[];
  @ApiProperty({ type: ProductInventoryEntity, nullable: true }) inventory: ProductInventoryEntity | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
