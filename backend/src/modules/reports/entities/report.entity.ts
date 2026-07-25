import { ApiProperty } from '@nestjs/swagger';

export class SalesReportEntity {
  @ApiProperty() startDate: Date;
  @ApiProperty() endDate: Date;
  @ApiProperty() totalRevenue: number;
  @ApiProperty() totalOrders: number;
  @ApiProperty() averageOrderValue: number;
  @ApiProperty() totalDiscountGiven: number;
  @ApiProperty() cancelledOrders: number;
}

export class CustomerReportEntity {
  @ApiProperty() startDate: Date;
  @ApiProperty() endDate: Date;
  @ApiProperty() newCustomers: number;
  @ApiProperty() totalCustomers: number;
}

export class TopCustomerEntity {
  @ApiProperty() customerId: string;
  @ApiProperty() name: string;
  @ApiProperty() totalOrders: number;
  @ApiProperty() totalSpent: number;
}
