import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { DashboardService } from '../services/dashboard.service';
import { RevenueChartQueryDto } from '../dto/revenue-chart-query.dto';
import { LimitQueryDto } from '../dto/limit-query.dto';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: "Today's/monthly sales, revenue, orders, customers, products at a glance" })
  async getSummary() {
    const data = await this.dashboardService.getSummary();
    return { message: 'Dashboard summary fetched successfully', data };
  }

  @Get('revenue-chart')
  @ApiOperation({ summary: 'Revenue + order-count chart data for the last week / month / year' })
  async getRevenueChart(@Query() query: RevenueChartQueryDto) {
    const data = await this.dashboardService.getRevenueChart(query);
    return { message: 'Revenue chart fetched successfully', data };
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Best-selling products by quantity sold' })
  async getTopProducts(@Query() query: LimitQueryDto) {
    const data = await this.dashboardService.getTopProducts(query.limit ?? 10);
    return { message: 'Top products fetched successfully', data };
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Products at or below their low-stock threshold' })
  async getLowStock(@Query() query: LimitQueryDto) {
    const data = await this.dashboardService.getLowStockProducts(query.limit ?? 10);
    return { message: 'Low stock products fetched successfully', data };
  }

  @Get('recent-orders')
  @ApiOperation({ summary: 'Most recently placed orders' })
  async getRecentOrders(@Query() query: LimitQueryDto) {
    const data = await this.dashboardService.getRecentOrders(query.limit ?? 10);
    return { message: 'Recent orders fetched successfully', data };
  }
}
