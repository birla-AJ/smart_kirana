import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRazorpayOrderDto {
  @ApiProperty({ example: 'clx0000000000000000orderid' })
  @IsString()
  @IsNotEmpty()
  orderId: string;
}
