import { ApiProperty } from '@nestjs/swagger';

export class CartItemEntity {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty() productName: string;
  @ApiProperty({ nullable: true }) productImage: string | null;
  @ApiProperty({ nullable: true }) variantId: string | null;
  @ApiProperty({ nullable: true }) variantName: string | null;
  @ApiProperty() quantity: number;
  @ApiProperty() price: number;
  @ApiProperty() lineTotal: number;
  @ApiProperty() availableStock: number;
}

export class CartEntity {
  @ApiProperty() id: string;
  @ApiProperty({ type: [CartItemEntity] }) items: CartItemEntity[];
  @ApiProperty() itemCount: number;
  @ApiProperty() subtotal: number;
}
