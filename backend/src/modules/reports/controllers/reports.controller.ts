import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { ReportsService } from '../services/reports.service';
import { DateRangeQueryDto } from '../dto/date-range-query.dto';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Sales totals for a date range (defaults to the last 30 days)' })
  async getSalesReport(@Query() query: DateRangeQueryDto) {
    const data = await this.reportsService.getSalesReport(query);
    return { message: 'Sales report fetched successfully', data };
  }

  @Get('customers')
  @ApiOperation({ summary: 'New vs total customer counts for a date range' })
  async getCustomerReport(@Query() query: DateRangeQueryDto) {
    const data = await this.reportsService.getCustomerReport(query);
    return { message: 'Customer report fetched successfully', data };
  }

  @Get('customers/top')
  @ApiOperation({ summary: 'Top customers by spend within a date range' })
  async getTopCustomers(@Query() query: DateRangeQueryDto) {
    const data = await this.reportsService.getTopCustomers(query);
    return { message: 'Top customers fetched successfully', data };
  }

  @Get('sales/export')
  @ApiOperation({ summary: 'Download a CSV of every order in a date range' })
  async exportSalesCsv(@Query() query: DateRangeQueryDto, @Res() res: Response) {
    const csv = await this.reportsService.exportSalesCsv(query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sales-report.csv"');
    res.send(csv);
  }

  @Get('inventory/export')
  @ApiOperation({ summary: 'Download a CSV of current stock levels for every product' })
  async exportInventoryCsv(@Res() res: Response) {
    const csv = await this.reportsService.exportInventoryCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory-report.csv"');
    res.send(csv);
  }
}
