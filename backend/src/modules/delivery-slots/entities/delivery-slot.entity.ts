import { ApiProperty } from '@nestjs/swagger';
import { DeliverySlotStatus } from '@prisma/client';

export class DeliverySlotEntity {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() startTime: string;
  @ApiProperty() endTime: string;
  @ApiProperty() maxOrders: number;
  @ApiProperty() bookedOrders: number;
  @ApiProperty({ enum: DeliverySlotStatus }) status: DeliverySlotStatus;
}
