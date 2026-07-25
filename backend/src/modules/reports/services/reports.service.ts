import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { DateRangeQueryDto } from '../dto/date-range-query.dto';
import { CustomerReportEntity, SalesReportEntity, TopCustomerEntity } from '../entities/report.entity';

const NON_REVENUE_STATUSES: OrderStatus[] = [
  OrderStatus.CANCELLED,
  OrderStatus.RETURNED,
  OrderStatus.REFUNDED,
];

function resolveRange(query: DateRangeQueryDto): { start: Date; end: Date } {
  const end = query.endDate ? new Date(query.endDate) : new Date();
  const start = query.startDate
    ? new Date(query.startDate)
    : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { start, end };
}

/** Escapes a CSV field: wraps in quotes and doubles any embedded quotes if needed. */
function csvField(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSalesReport(query: DateRangeQueryDto): Promise<SalesReportEntity> {
    const { start, end } = resolveRange(query);

    const [revenueAgg, cancelledCount] = await this.prisma.$transaction([
      this.prisma.order.aggregate({
        where: { status: { notIn: NON_REVENUE_STATUSES }, createdAt: { gte: start, lte: end } },
        _sum: { total: true, discount: true },
        _count: true,
      }),
      this.prisma.order.count({
        where: { status: OrderStatus.CANCELLED, createdAt: { gte: start, lte: end } },
      }),
    ]);

    const totalRevenue = Number(revenueAgg._sum.total ?? 0);
    const totalOrders = revenueAgg._count;

    return {
      startDate: start,
      endDate: end,
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
      totalDiscountGiven: Number(revenueAgg._sum.discount ?? 0),
      cancelledOrders: cancelledCount,
    };
  }

  async getCustomerReport(query: DateRangeQueryDto): Promise<CustomerReportEntity> {
    const { start, end } = resolveRange(query);
    const [newCustomers, totalCustomers] = await this.prisma.$transaction([
      this.prisma.customer.count({ where: { createdAt: { gte: start, lte: end } } }),
      this.prisma.customer.count(),
    ]);
    return { startDate: start, endDate: end, newCustomers, totalCustomers };
  }

  async getTopCustomers(query: DateRangeQueryDto, limit = 10): Promise<TopCustomerEntity[]> {
    const { start, end } = resolveRange(query);

    const grouped = await this.prisma.order.groupBy({
      by: ['customerId'],
      where: { status: { notIn: NON_REVENUE_STATUSES }, createdAt: { gte: start, lte: end } },
      _sum: { total: true },
      _count: true,
      orderBy: { _sum: { total: 'desc' } },
      take: limit,
    });

    if (grouped.length === 0) return [];

    const customers = await this.prisma.customer.findMany({
      where: { id: { in: grouped.map((g) => g.customerId) } },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
    const customerMap = new Map(customers.map((c) => [c.id, c]));

    return grouped.map((g) => {
      const customer = customerMap.get(g.customerId);
      return {
        customerId: g.customerId,
        name: customer ? `${customer.user.firstName} ${customer.user.lastName ?? ''}`.trim() : 'Unknown',
        totalOrders: g._count,
        totalSpent: Number(g._sum.total ?? 0),
      };
    });
  }

  /** Builds a CSV export of every revenue-counted order in the range. */
  async exportSalesCsv(query: DateRangeQueryDto): Promise<string> {
    const { start, end } = resolveRange(query);

    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: start, lte: end } },
      include: { customer: { include: { user: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const header = [
      'Order Number',
      'Date',
      'Customer',
      'Status',
      'Payment Status',
      'Subtotal',
      'Tax',
      'Delivery Charge',
      'Discount',
      'Total',
    ];

    const rows = orders.map((o) => [
      o.orderNumber,
      o.createdAt.toISOString(),
      `${o.customer.user.firstName} ${o.customer.user.lastName ?? ''}`.trim(),
      o.status,
      o.paymentStatus,
      Number(o.subtotal).toFixed(2),
      Number(o.tax).toFixed(2),
      Number(o.deliveryCharge).toFixed(2),
      Number(o.discount).toFixed(2),
      Number(o.total).toFixed(2),
    ]);

    return [header, ...rows].map((row) => row.map(csvField).join(',')).join('\n');
  }

  /** Builds a CSV export of current stock levels for every product. */
  async exportInventoryCsv(): Promise<string> {
    const rows = await this.prisma.inventory.findMany({
      include: { product: { select: { name: true, sku: true } } },
      orderBy: { product: { name: 'asc' } },
    });

    const header = ['Product', 'SKU', 'Total Stock', 'Reserved', 'Available', 'Low Stock Threshold', 'Status'];
    const csvRows = rows.map((r) => [
      r.product.name,
      r.product.sku,
      r.totalStock,
      r.reservedStock,
      r.availableStock,
      r.lowStockThreshold,
      r.availableStock <= r.lowStockThreshold ? 'LOW STOCK' : 'OK',
    ]);

    return [header, ...csvRows].map((row) => row.map(csvField).join(',')).join('\n');
  }
}
