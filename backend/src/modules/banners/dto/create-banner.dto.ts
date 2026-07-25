import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { BannerType } from '@prisma/client';

export class CreateBannerDto {
  @ApiProperty({ example: 'Independence Day Sale' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'https://cdn.nimadkirana.com/banners/i-day.png' })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({ required: false, example: '/offers/independence-day-sale' })
  @IsOptional()
  @IsString()
  redirectUrl?: string;

  @ApiProperty({ enum: BannerType, example: BannerType.HOME })
  @IsEnum(BannerType)
  type: BannerType;

  @ApiProperty({ default: 0, required: false })
  @IsOptional()
  @IsInt()
  sortOrder?: number = 0;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
