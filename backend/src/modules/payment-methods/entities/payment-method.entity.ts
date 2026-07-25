import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethodType } from '@prisma/client';

export class PaymentMethodEntity {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty({ enum: PaymentMethodType }) type: PaymentMethodType;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty() isActive: boolean;
}
