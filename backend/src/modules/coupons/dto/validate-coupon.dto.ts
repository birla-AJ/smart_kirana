import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class ValidateCouponDto {
  @ApiProperty({ example: 'WELCOME50' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 499 })
  @IsNumber()
  @IsPositive()
  orderAmount: number;
}
