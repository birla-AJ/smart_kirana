import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class DashboardSummaryEntity {
  @ApiProperty({ example: 12500.5 })
  todaysSales: number;

  @ApiProperty({ example: 15 })
  todaysOrders: number;

  @ApiProperty({ example: 385000 })
  monthlySales: number;

  @ApiProperty({ example: 412 })
  monthlyOrders: number;

  @ApiProperty({ example: 1245000 })
  totalRevenue: number;

  @ApiProperty({ example: 3210 })
  totalOrders: number;

  @ApiProperty({ example: 48 })
  pendingOrders: number;

  @ApiProperty({ example: 980 })
  totalCustomers: number;

  @ApiProperty({ example: 25 })
  newCustomersThisMonth: number;

  @ApiProperty({ example: 640 })
  totalProducts: number;

  @ApiProperty({ example: 12 })
  lowStockProductsCount: number;
}

export class RevenueChartPointEntity {
  @ApiProperty({ example: '2026-07-20' })
  label: string;

  @ApiProperty({ example: 18450.75 })
  revenue: number;

  @ApiProperty({ example: 22 })
  orders: number;
}

export class TopProductEntity {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  image: string | null;

  @ApiProperty()
  unitsSold: number;

  @ApiProperty()
  revenue: number;
}

export class LowStockProductEntity {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  availableStock: number;

  @ApiProperty()
  lowStockThreshold: number;
}

export class RecentOrderEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty()
  total: number;

  @ApiProperty()
  itemCount: number;

  @ApiProperty()
  createdAt: Date;
}
