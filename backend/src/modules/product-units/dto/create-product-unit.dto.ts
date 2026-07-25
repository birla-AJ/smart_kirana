import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ProductUnitType } from '@prisma/client';

export class CreateProductUnitDto {
  @ApiProperty({ example: 'Kilogram' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'kg' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  shortName: string;

  @ApiProperty({ enum: ProductUnitType, example: ProductUnitType.KG })
  @IsEnum(ProductUnitType)
  type: ProductUnitType;
}
