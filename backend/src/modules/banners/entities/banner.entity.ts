import { ApiProperty } from '@nestjs/swagger';
import { BannerType } from '@prisma/client';

export class BannerEntity {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() image: string;
  @ApiProperty({ nullable: true }) redirectUrl: string | null;
  @ApiProperty({ enum: BannerType }) type: BannerType;
  @ApiProperty() sortOrder: number;
  @ApiProperty() isActive: boolean;
  @ApiProperty({ nullable: true }) startDate: Date | null;
  @ApiProperty({ nullable: true }) endDate: Date | null;
}
