import { ApiProperty } from '@nestjs/swagger';

export class WishlistItemEntity {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() productName: string;
  @ApiProperty({ nullable: true }) productImage: string | null;
  @ApiProperty() price: number;
  @ApiProperty() inStock: boolean;
  @ApiProperty() createdAt: Date;
}
