import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';

export class RazorpayOrderEntity {
  @ApiProperty() gatewayOrderId: string;
  @ApiProperty() amount: number;
  @ApiProperty({ example: 'INR' }) currency: string;
  @ApiProperty() keyId: string;
}

export class PaymentEntity {
  @ApiProperty() id: string;
  @ApiProperty() orderId: string;
  @ApiProperty({ nullable: true }) transactionId: string | null;
  @ApiProperty({ nullable: true }) gatewayOrderId: string | null;
  @ApiProperty({ nullable: true }) gatewayPaymentId: string | null;
  @ApiProperty() amount: number;
  @ApiProperty({ enum: PaymentStatus }) status: PaymentStatus;
  @ApiProperty({ nullable: true }) paidAt: Date | null;
  @ApiProperty({ nullable: true }) failureReason: string | null;
}
