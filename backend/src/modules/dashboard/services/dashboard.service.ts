import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { RevenueChartQueryDto, RevenueChartRange } from '../dto/revenue-chart-query.dto';
import {
  DashboardSummaryEntity,
  LowStockProductEntity,
  RecentOrderEntity,
  RevenueChartPointEntity,
  TopProductEntity,
} from '../entities/dashboard.entity';

// Orders in these statuses never contributed real revenue, so every
// sales/revenue aggregate in this module excludes them.
const NON_REVENUE_STATUSES: OrderStatus[] = [
  OrderStatus.CANCELLED,
  OrderStatus.RETURNED,
  OrderStatus.REFUNDED,
];

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<DashboardSummaryEntity> {
    const now = new Date();
    const todayStart = startOfDay(now);
    const monthStart = startOfMonth(now);

    const revenueWhere = { status: { notIn: NON_REVENUE_STATUSES } };

    const [
      todaysAgg,
      monthlyAgg,
      totalAgg,
      pendingOrders,
      totalCustomers,
      newCustomersThisMonth,
      totalProducts,
      inventoryLevels,
    ] = await this.prisma.$transaction([
      this.prisma.order.aggregate({
        where: { ...revenueWhere, createdAt: { gte: todayStart } },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.order.aggregate({
        where: { ...revenueWhere, createdAt: { gte: monthStart } },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.order.aggregate({
        where: revenueWhere,
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.customer.count(),
      this.prisma.customer.count({ where: { createdAt: { gte: monthStart } } }),
      this.prisma.product.count(),
      this.prisma.inventory.findMany({
        select: { availableStock: true, lowStockThreshold: true },
      }),
    ]);

    const lowStockProductsCount = inventoryLevels.filter(
      (inv) => inv.availableStock <= inv.lowStockThreshold,
    ).length;

    return {
      todaysSales: Number(todaysAgg._sum.total ?? 0),
      todaysOrders: todaysAgg._count,
      monthlySales: Number(monthlyAgg._sum.total ?? 0),
      monthlyOrders: monthlyAgg._count,
      totalRevenue: Number(totalAgg._sum.total ?? 0),
      totalOrders: totalAgg._count,
      pendingOrders,
      totalCustomers,
      newCustomersThisMonth,
      totalProducts,
      lowStockProductsCount,
    };
  }

  async getRevenueChart(query: RevenueChartQueryDto): Promise<RevenueChartPointEntity[]> {
    const range: RevenueChartRange = query.range ?? 'week';
    const now = new Date();

    let start: Date;
    let bucket: 'day' | 'month';

    if (range === 'week') {
      start = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
      bucket = 'day';
    } else if (range === 'month') {
      start = startOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));
      bucket = 'day';
    } else {
      start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      bucket = 'month';
    }

    const orders = await this.prisma.order.findMany({
      where: { status: { notIn: NON_REVENUE_STATUSES }, createdAt: { gte: start } },
      select: { total: true, createdAt: true },
    });

    const buckets = new Map<string, { revenue: number; orders: number }>();

    const labelFor = (date: Date): string =>
      bucket === 'day'
        ? date.toISOString().slice(0, 10)
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    // Pre-seed every bucket in range with zero so the chart has no gaps.
    if (bucket === 'day') {
      const totalDays = range === 'week' ? 7 : 30;
      for (let i = 0; i < totalDays; i++) {
        const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
        buckets.set(labelFor(d), { revenue: 0, orders: 0 });
      }
    } else {
      for (let i = 0; i < 12; i++) {
        const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
        buckets.set(labelFor(d), { revenue: 0, orders: 0 });
      }
    }

    for (const order of orders) {
      const label = labelFor(order.createdAt);
      const entry = buckets.get(label) ?? { revenue: 0, orders: 0 };
      entry.revenue += Number(order.total);
      entry.orders += 1;
      buckets.set(label, entry);
    }

    return Array.from(buckets.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([label, value]) => ({ label, revenue: value.revenue, orders: value.orders }));
  }

  async getTopProducts(limit: number): Promise<TopProductEntity[]> {
    const grouped = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { status: { notIn: NON_REVENUE_STATUSES } } },
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    if (grouped.length === 0) return [];

    const products = await this.prisma.product.findMany({
      where: { id: { in: grouped.map((g) => g.productId) } },
      include: { images: { where: { isPrimary: true }, take: 1 } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    return grouped.map((g) => {
      const product = productMap.get(g.productId);
      return {
        productId: g.productId,
        name: product?.name ?? 'Unknown product',
        image: product?.images[0]?.imageUrl ?? null,
        unitsSold: g._sum.quantity ?? 0,
        revenue: Number(g._sum.total ?? 0),
      };
    });
  }

  async getLowStockProducts(limit: number): Promise<LowStockProductEntity[]> {
    const rows = await this.prisma.inventory.findMany({
      include: { product: { select: { id: true, name: true, sku: true } } },
    });

    return rows
      .filter((row) => row.availableStock <= row.lowStockThreshold)
      .sort((a, b) => a.availableStock - b.availableStock)
      .slice(0, limit)
      .map((row) => ({
        productId: row.product.id,
        name: row.product.name,
        sku: row.product.sku,
        availableStock: row.availableStock,
        lowStockThreshold: row.lowStockThreshold,
      }));
  }

  async getRecentOrders(limit: number): Promise<RecentOrderEntity[]> {
    const orders = await this.prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { include: { user: true } },
        _count: { select: { items: true } },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: `${order.customer.user.firstName} ${order.customer.user.lastName ?? ''}`.trim(),
      status: order.status,
      total: Number(order.total),
      itemCount: order._count.items,
      createdAt: order.createdAt,
    }));
  }
}
