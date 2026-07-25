import { ApiProperty } from '@nestjs/swagger';

export class SubCategoryEntity {
  @ApiProperty() id: string;
  @ApiProperty() categoryId: string;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiProperty({ nullable: true }) image: string | null;
  @ApiProperty({ nullable: true }) description: string | null;
  @ApiProperty() isActive: boolean;
  @ApiProperty() sortOrder: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
