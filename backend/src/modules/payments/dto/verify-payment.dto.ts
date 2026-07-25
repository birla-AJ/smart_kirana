import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({ example: 'clx0000000000000000orderid' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ example: 'order_LZP...' })
  @IsString()
  @IsNotEmpty()
  razorpayOrderId: string;

  @ApiProperty({ example: 'pay_LZQ...' })
  @IsString()
  @IsNotEmpty()
  razorpayPaymentId: string;

  @ApiProperty({ example: '9ef4...signature' })
  @IsString()
  @IsNotEmpty()
  razorpaySignature: string;
}
