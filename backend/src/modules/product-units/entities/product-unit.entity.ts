import { ApiProperty } from '@nestjs/swagger';
import { ProductUnitType } from '@prisma/client';

export class ProductUnitEntity {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() shortName: string;
  @ApiProperty({ enum: ProductUnitType }) type: ProductUnitType;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
