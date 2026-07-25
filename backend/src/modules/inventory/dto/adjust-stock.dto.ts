import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { StockMovementType } from '@prisma/client';

export class AdjustStockDto {
  @ApiProperty({ enum: StockMovementType, example: StockMovementType.IN })
  @IsEnum(StockMovementType)
  type: StockMovementType;

  @ApiProperty({ example: 50, description: 'Positive quantity; direction is determined by `type`' })
  @IsInt()
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 'New stock received from supplier', required: false })
  @IsOptional()
  @IsString()
  remarks?: string;
}
