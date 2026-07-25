import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { OfferType } from '@prisma/client';

export class CreateOfferDto {
  @ApiProperty({ example: 'Flat 20% off on Dairy products' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: OfferType, example: OfferType.CATEGORY })
  @IsEnum(OfferType)
  type: OfferType;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @IsPositive()
  value: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: '2026-08-01T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-08-31T23:59:59.000Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
