import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { CouponType } from '@prisma/client';

export class CreateCouponDto {
  @ApiProperty({ example: 'WELCOME50' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Welcome Discount' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CouponType, example: CouponType.PERCENTAGE })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ example: 10, description: 'Flat amount or percentage, depending on `type`' })
  @IsNumber()
  @IsPositive()
  value: number;

  @ApiProperty({ example: 199, default: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number = 0;

  @ApiProperty({ example: 100, required: false, description: 'Cap for PERCENTAGE coupons' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumDiscount?: number;

  @ApiProperty({ example: 500, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

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
