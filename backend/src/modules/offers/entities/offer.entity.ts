import { ApiProperty } from '@nestjs/swagger';
import { OfferType } from '@prisma/client';

export class OfferEntity {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty({ enum: OfferType }) type: OfferType;
  @ApiProperty() value: number;
  @ApiProperty({ nullable: true }) image: string | null;
  @ApiProperty() startDate: Date;
  @ApiProperty() endDate: Date;
  @ApiProperty() isActive: boolean;
}
