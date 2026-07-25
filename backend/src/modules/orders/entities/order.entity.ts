import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export class OrderItemEntity {
  @ApiProperty() id: string;
  @ApiProperty() productId: string;
  @ApiProperty({ nullable: true }) variantId: string | null;
  @ApiProperty() productName: string;
  @ApiProperty({ nullable: true }) variantName: string | null;
  @ApiProperty() sku: string;
  @ApiProperty() quantity: number;
  @ApiProperty() mrp: number;
  @ApiProperty() sellingPrice: number;
  @ApiProperty() discount: number;
  @ApiProperty() total: number;
}

export class OrderStatusHistoryEntity {
  @ApiProperty() id: string;
  @ApiProperty({ enum: OrderStatus }) status: OrderStatus;
  @ApiProperty({ nullable: true }) remarks: string | null;
  @ApiProperty() createdAt: Date;
}

export class OrderEntity {
  @ApiProperty() id: string;
  @ApiProperty() orderNumber: string;
  @ApiProperty() customerId: string;
  @ApiProperty() addressId: string;
  @ApiProperty({ nullable: true }) deliverySlotId: string | null;
  @ApiProperty({ nullable: true }) couponId: string | null;
  @ApiProperty({ enum: OrderStatus }) status: OrderStatus;
  @ApiProperty({ enum: PaymentStatus }) paymentStatus: PaymentStatus;
  @ApiProperty() subtotal: number;
  @ApiProperty() tax: number;
  @ApiProperty() deliveryCharge: number;
  @ApiProperty() discount: number;
  @ApiProperty() total: number;
  @ApiProperty({ nullable: true }) notes: string | null;
  @ApiProperty({ type: [OrderItemEntity] }) items: OrderItemEntity[];
  @ApiProperty({ type: [OrderStatusHistoryEntity] }) statusHistory: OrderStatusHistoryEntity[];
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
