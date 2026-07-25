import { ApiProperty } from '@nestjs/swagger';

export class BrandEntity {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiProperty({ nullable: true }) logo: string | null;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
