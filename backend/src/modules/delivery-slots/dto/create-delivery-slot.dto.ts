import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Matches } from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreateDeliverySlotDto {
  @ApiProperty({ example: 'Morning Slot' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '08:00' })
  @IsString()
  @Matches(TIME_PATTERN, { message: 'startTime must be in HH:mm 24-hour format' })
  startTime: string;

  @ApiProperty({ example: '11:00' })
  @IsString()
  @Matches(TIME_PATTERN, { message: 'endTime must be in HH:mm 24-hour format' })
  endTime: string;

  @ApiProperty({ example: 100, default: 100, required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  maxOrders?: number = 100;
}
