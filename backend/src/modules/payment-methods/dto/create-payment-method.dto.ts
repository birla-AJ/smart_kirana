import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaymentMethodType } from '@prisma/client';

export class CreatePaymentMethodDto {
  @ApiProperty({ example: 'Cash on Delivery' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: PaymentMethodType, example: PaymentMethodType.CASH })
  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
