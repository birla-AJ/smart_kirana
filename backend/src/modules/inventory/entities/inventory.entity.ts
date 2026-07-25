import { ApiProperty } from '@nestjs/swagger';
import { StockMovementType } from '@prisma/client';

export class InventoryEntity {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() productName: string;
  @ApiProperty() sku: string;
  @ApiProperty() totalStock: number;
  @ApiProperty() reservedStock: number;
  @ApiProperty() availableStock: number;
  @ApiProperty() lowStockThreshold: number;
  @ApiProperty() updatedAt: Date;
}

export class StockMovementEntity {
  @ApiProperty() id: string;
  @ApiProperty({ enum: StockMovementType }) type: StockMovementType;
  @ApiProperty() quantity: number;
  @ApiProperty() previousStock: number;
  @ApiProperty() currentStock: number;
  @ApiProperty({ nullable: true }) referenceId: string | null;
  @ApiProperty({ nullable: true }) remarks: string | null;
  @ApiProperty() createdAt: Date;
}
