import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { OrderStatus, PaymentStatus, Prisma, WalletTransactionType } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { CouponsService } from '../../coupons/services/coupons.service';
import { SettingsService } from '../../settings/services/settings.service';
import { DeliverySlotsService } from '../../delivery-slots/services/delivery-slots.service';
import { WalletService } from '../../customers/services/wallet.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { CancelOrderDto } from '../dto/cancel-order.dto';
import { QueryOrderDto } from '../dto/query-order.dto';
import { OrderEntity } from '../entities/order.entity';
import { buildPaginatedResponse } from '../../../common/utils/paginate.util';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

const ORDER_INCLUDE = {
  items: true,
  statusHistory: { orderBy: { createdAt: 'asc' as const } },
};

type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof ORDER_INCLUDE }>;

// Orders can only ever move forward along this path, or jump sideways
// into CANCELLED / RETURNED / REFUNDED from an allowed state.
const FORWARD_FLOW: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.PACKED,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
];

const CANCELLABLE_STATUSES: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.CONFIRMED];

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryService: InventoryService,
    private readonly couponsService: CouponsService,
    private readonly settingsService: SettingsService,
    private readonly deliverySlotsService: DeliverySlotsService,
    private readonly walletService: WalletService,
  ) {}

  private toEntity(order: OrderWithRelations): OrderEntity {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      addressId: order.addressId,
      deliverySlotId: order.deliverySlotId,
      couponId: order.couponId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      deliveryCharge: Number(order.deliveryCharge),
      discount: Number(order.discount),
      total: Number(order.total),
      notes: order.notes,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        variantName: item.variantName,
        sku: item.sku,
        quantity: item.quantity,
        mrp: Number(item.mrp),
        sellingPrice: Number(item.sellingPrice),
        discount: Number(item.discount),
        total: Number(item.total),
      })),
      statusHistory: order.statusHistory.map((h) => ({
        id: h.id,
        status: h.status,
        remarks: h.remarks,
        createdAt: h.createdAt,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private generateOrderNumber(): string {
    return `NK${Date.now().toString(36).toUpperCase()}${randomBytes(2).toString('hex').toUpperCase()}`;
  }

  async createOrder(customerId: string, dto: CreateOrderDto): Promise<OrderEntity> {
    const cart = await this.prisma.cart.findUnique({
      where: { customerId },
      include: { items: { include: { product: true, variant: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    const address = await this.prisma.customerAddress.findFirst({
      where: { id: dto.addressId, customerId },
    });
    if (!address) throw new BadRequestException('Address not found or does not belong to you');

    if (dto.deliverySlotId) {
      await this.deliverySlotsService.assertCapacity(dto.deliverySlotId);
    }

    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { type: dto.paymentMethodType, isActive: true },
    });
    if (!paymentMethod) {
      throw new BadRequestException(`Payment method "${dto.paymentMethodType}" is not available`);
    }

    // Re-price every line against the *live* variant, never the
    // possibly-stale price captured when the item was added to cart.
    let subtotal = 0;
    let tax = 0;
    const itemsData = cart.items.map((item) => {
      if (!item.variant) {
        throw new BadRequestException(`Item "${item.product.name}" no longer has a valid variant`);
      }
      const sellingPrice = Number(item.variant.sellingPrice);
      const mrp = Number(item.variant.mrp);
      const lineTotal = sellingPrice * item.quantity;
      subtotal += lineTotal;
      tax += (lineTotal * Number(item.product.taxPercentage)) / 100;

      return {
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        variantName: item.variant.name,
        sku: item.variant.sku,
        quantity: item.quantity,
        mrp,
        sellingPrice,
        discount: (mrp - sellingPrice) * item.quantity,
        total: lineTotal,
      };
    });

    let discount = 0;
    let couponId: string | undefined;
    if (dto.couponCode) {
      const result = await this.couponsService.validate(dto.couponCode, subtotal);
      discount = result.discountAmount;
      couponId = result.coupon.id;
    }

    const flatCharge = await this.settingsService.getValue<number>('delivery.flatCharge', 30);
    const freeThreshold = await this.settingsService.getValue<number>('delivery.freeDeliveryThreshold', 199);
    const deliveryCharge = subtotal >= freeThreshold ? 0 : flatCharge;

    const total = Math.max(subtotal + tax + deliveryCharge - discount, 0);

    const order = await this.prisma.$transaction(async (tx) => {
      for (const item of itemsData) {
        await this.inventoryService.reserveStock(tx, item.productId, item.quantity);
      }

      if (couponId) {
        await this.couponsService.incrementUsage(tx, couponId);
      }

      const orderNumber = this.generateOrderNumber();
      const isWalletPayment = dto.paymentMethodType === 'WALLET';

      if (isWalletPayment) {
        const customer = await tx.customer.findUniqueOrThrow({ where: { id: customerId } });
        if (Number(customer.walletBalance) < total) {
          throw new BadRequestException('Insufficient wallet balance to place this order');
        }
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          addressId: dto.addressId,
          deliverySlotId: dto.deliverySlotId,
          couponId,
          subtotal,
          tax,
          deliveryCharge,
          discount,
          total,
          notes: dto.notes,
          paymentStatus: isWalletPayment ? 'SUCCESS' : undefined,
          items: { create: itemsData },
          statusHistory: { create: { status: OrderStatus.PENDING, remarks: 'Order placed' } },
          payment: {
            create: {
              methodId: paymentMethod.id,
              amount: total,
              status: isWalletPayment ? 'SUCCESS' : undefined,
              paidAt: isWalletPayment ? new Date() : undefined,
            },
          },
        },
        include: ORDER_INCLUDE,
      });

      if (isWalletPayment) {
        const customer = await tx.customer.update({
          where: { id: customerId },
          data: { walletBalance: { decrement: total } },
        });
        await tx.walletTransaction.create({
          data: {
            customerId,
            type: WalletTransactionType.DEBIT,
            amount: total,
            balanceAfter: customer.walletBalance,
            reason: `Payment for order ${orderNumber}`,
            referenceType: 'ORDER_PAYMENT',
            referenceId: created.id,
          },
        });
      }

      await tx.customer.update({ where: { id: customerId }, data: { totalOrders: { increment: 1 } } });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    return this.toEntity(order);
  }

  async findAll(query: QueryOrderDto): Promise<PaginatedResponseDto<OrderEntity>> {
    const where: Prisma.OrderWhereInput = {
      ...(query.customerId ? { customerId: query.customerId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.paymentStatus ? { paymentStatus: query.paymentStatus } : {}),
      ...(query.search ? { orderNumber: { contains: query.search, mode: 'insensitive' } } : {}),
    };

    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: ORDER_INCLUDE,
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return buildPaginatedResponse(
      rows.map((r) => this.toEntity(r)),
      totalItems,
      query.page ?? 1,
      query.take,
    );
  }

  async findAllForCustomer(customerId: string, query: PaginationQueryDto): Promise<PaginatedResponseDto<OrderEntity>> {
    const where = { customerId };
    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include: ORDER_INCLUDE,
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);
    return buildPaginatedResponse(rows.map((r) => this.toEntity(r)), totalItems, query.page ?? 1, query.take);
  }

  async findOne(id: string, customerId?: string): Promise<OrderEntity> {
    const order = await this.prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
    if (!order) throw new NotFoundException(`Order with id "${id}" not found`);
    if (customerId && order.customerId !== customerId) {
      throw new ForbiddenException('This order does not belong to you');
    }
    return this.toEntity(order);
  }

  private assertForwardTransition(current: OrderStatus, next: OrderStatus): void {
    const terminal: OrderStatus[] = [OrderStatus.CANCELLED, OrderStatus.RETURNED, OrderStatus.REFUNDED];
    if (terminal.includes(current)) {
      throw new BadRequestException(`Order is already in a terminal state (${current})`);
    }
    if (terminal.includes(next)) return; // cancellation/return/refund handled separately below

    const currentIndex = FORWARD_FLOW.indexOf(current);
    const nextIndex = FORWARD_FLOW.indexOf(next);
    if (nextIndex !== currentIndex + 1) {
      throw new BadRequestException(`Cannot move order from ${current} directly to ${next}`);
    }
  }

  /** Admin-driven status update (confirm, process, pack, ship, deliver, or cancel/return/refund). */
  async updateStatus(id: string, dto: UpdateOrderStatusDto, changedBy?: string): Promise<OrderEntity> {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new NotFoundException(`Order with id "${id}" not found`);

    this.assertForwardTransition(order.status, dto.status);

    await this.prisma.$transaction(async (tx) => {
      if (dto.status === OrderStatus.DELIVERED) {
        for (const item of order.items) {
          await this.inventoryService.deductStock(tx, item.productId, item.quantity, order.id);
        }
        await tx.customer.update({
          where: { id: order.customerId },
          data: {
            totalSpent: { increment: order.total },
            loyaltyPoints: { increment: Math.floor(Number(order.total) / 10) },
          },
        });
        await tx.order.update({
          where: { id },
          data: { status: dto.status, paymentStatus: PaymentStatus.SUCCESS },
        });
      } else if (dto.status === OrderStatus.CANCELLED) {
        if (!CANCELLABLE_STATUSES.includes(order.status)) {
          throw new BadRequestException(`Order in status ${order.status} can no longer be cancelled`);
        }
        for (const item of order.items) {
          await this.inventoryService.releaseStock(tx, item.productId, item.quantity);
        }
        await tx.order.update({ where: { id }, data: { status: dto.status } });
      } else {
        await tx.order.update({ where: { id }, data: { status: dto.status } });
      }

      await tx.orderStatusHistory.create({
        data: { orderId: id, status: dto.status, remarks: dto.remarks, changedBy },
      });
    });

    // Refund handling happens as a deliberate second step after the
    // status-change transaction commits, since WalletService opens its
    // own transaction for the credit + ledger entry.
    if (dto.status === OrderStatus.REFUNDED && order.paymentStatus === PaymentStatus.SUCCESS) {
      await this.walletService.adjustBalance(
        order.customerId,
        { type: WalletTransactionType.CREDIT, amount: Number(order.total), reason: `Refund for order ${order.orderNumber}` },
        'ORDER_REFUND',
        order.id,
      );
      await this.prisma.order.update({ where: { id }, data: { paymentStatus: PaymentStatus.REFUNDED } });
    }

    return this.findOne(id);
  }

  /** Customer-initiated cancellation, only while the order hasn't started being fulfilled. */
  async cancelOrder(id: string, customerId: string, dto: CancelOrderDto): Promise<OrderEntity> {
    await this.findOne(id, customerId); // throws if the order isn't this customer's
    return this.updateStatus(id, { status: OrderStatus.CANCELLED, remarks: dto.reason }, customerId);
  }
}
