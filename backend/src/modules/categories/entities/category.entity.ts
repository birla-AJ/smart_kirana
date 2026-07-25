import { ApiProperty } from '@nestjs/swagger';

export class CategoryEntity {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiProperty({ nullable: true }) image: string | null;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() sortOrder: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
