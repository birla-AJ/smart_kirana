import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaymentMethodType } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({ example: 'clx0000000000000000addrid' })
  @IsString()
  @IsNotEmpty()
  addressId: string;

  @ApiProperty({ example: 'clx0000000000000000slotid', required: false })
  @IsOptional()
  @IsString()
  deliverySlotId?: string;

  @ApiProperty({ example: 'WELCOME50', required: false })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ enum: PaymentMethodType, example: PaymentMethodType.CASH })
  @IsEnum(PaymentMethodType)
  paymentMethodType: PaymentMethodType;

  @ApiProperty({ example: 'Please ring the bell twice', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
