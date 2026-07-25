import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { DeliverySlotStatus } from '@prisma/client';
import { CreateDeliverySlotDto } from './create-delivery-slot.dto';

export class UpdateDeliverySlotDto extends PartialType(CreateDeliverySlotDto) {
  @ApiProperty({ enum: DeliverySlotStatus, required: false })
  @IsOptional()
  @IsEnum(DeliverySlotStatus)
  status?: DeliverySlotStatus;
}
