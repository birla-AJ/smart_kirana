import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StockMovementType } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { AdjustStockDto } from '../dto/adjust-stock.dto';
import { QueryInventoryDto } from '../dto/query-inventory.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { buildPaginatedResponse } from '../../../common/utils/paginate.util';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { InventoryEntity, StockMovementEntity } from '../entities/inventory.entity';

type PrismaTx = Prisma.TransactionClient;

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryInventoryDto): Promise<PaginatedResponseDto<InventoryEntity>> {
    const rows = await this.prisma.inventory.findMany({
      where: query.search
        ? { product: { name: { contains: query.search, mode: 'insensitive' } } }
        : undefined,
      include: { product: { select: { name: true, sku: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    const filtered = query.lowStockOnly
      ? rows.filter((r) => r.availableStock <= r.lowStockThreshold)
      : rows;

    const page = query.page ?? 1;
    const limit = query.take;
    const paged = filtered.slice((page - 1) * limit, (page - 1) * limit + limit);

    return buildPaginatedResponse(
      paged.map((r) => this.toEntity(r)),
      filtered.length,
      page,
      limit,
    );
  }

  async findOne(productId: string): Promise<InventoryEntity> {
    const inventory = await this.prisma.inventory.findUnique({
      where: { productId },
      include: { product: { select: { name: true, sku: true } } },
    });
    if (!inventory) throw new NotFoundException(`Inventory not found for product "${productId}"`);
    return this.toEntity(inventory);
  }

  async getMovementHistory(
    productId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<StockMovementEntity>> {
    await this.findOne(productId);

    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.stockMovement.findMany({
        where: { productId },
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.stockMovement.count({ where: { productId } }),
    ]);

    return buildPaginatedResponse(rows, totalItems, query.page ?? 1, query.take);
  }

  /**
   * Manual admin stock correction. IN adds, OUT subtracts (blocked if it
   * would go negative), ADJUSTMENT sets the absolute total stock to the
   * given quantity (e.g. after a physical stock count).
   */
  async adjustStock(productId: string, dto: AdjustStockDto): Promise<InventoryEntity> {
    return this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({ where: { productId } });
      if (!inventory) throw new NotFoundException(`Inventory not found for product "${productId}"`);

      const previousStock = inventory.totalStock;
      let newTotal: number;
      let movementQuantity: number;

      if (dto.type === StockMovementType.IN) {
        newTotal = previousStock + dto.quantity;
        movementQuantity = dto.quantity;
      } else if (dto.type === StockMovementType.OUT) {
        newTotal = previousStock - dto.quantity;
        if (newTotal < 0) {
          throw new BadRequestException('Cannot remove more stock than is currently available');
        }
        movementQuantity = -dto.quantity;
      } else {
        newTotal = dto.quantity;
        movementQuantity = newTotal - previousStock;
      }

      const newAvailable = Math.max(newTotal - inventory.reservedStock, 0);

      const updated = await tx.inventory.update({
        where: { productId },
        data: { totalStock: newTotal, availableStock: newAvailable },
        include: { product: { select: { name: true, sku: true } } },
      });

      await tx.stockMovement.create({
        data: {
          inventoryId: inventory.id,
          productId,
          type: dto.type,
          quantity: movementQuantity,
          previousStock,
          currentStock: newTotal,
          remarks: dto.remarks,
        },
      });

      await this.syncProductStatus(tx, productId, newTotal);

      return this.toEntity(updated);
    });
  }

  /** Auto-flips a product to/from OUT_OF_STOCK based on its available total. */
  private async syncProductStatus(tx: PrismaTx, productId: string, totalStock: number): Promise<void> {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) return;

    if (totalStock <= 0 && product.status === 'ACTIVE') {
      await tx.product.update({ where: { id: productId }, data: { status: 'OUT_OF_STOCK' } });
    } else if (totalStock > 0 && product.status === 'OUT_OF_STOCK') {
      await tx.product.update({ where: { id: productId }, data: { status: 'ACTIVE' } });
    }
  }

  // ---------- Internal helpers used by the Orders module ----------

  /** Reserves stock when an order is placed (moves available -> reserved). */
  async reserveStock(tx: PrismaTx, productId: string, quantity: number): Promise<void> {
    const inventory = await tx.inventory.findUnique({ where: { productId } });
    if (!inventory || inventory.availableStock < quantity) {
      throw new BadRequestException(`Insufficient stock for product "${productId}"`);
    }
    await tx.inventory.update({
      where: { productId },
      data: {
        availableStock: { decrement: quantity },
        reservedStock: { increment: quantity },
      },
    });
  }

  /** Releases previously reserved stock (order cancelled before fulfillment). */
  async releaseStock(tx: PrismaTx, productId: string, quantity: number): Promise<void> {
    await tx.inventory.update({
      where: { productId },
      data: {
        availableStock: { increment: quantity },
        reservedStock: { decrement: quantity },
      },
    });
  }

  /** Converts reserved stock into a permanent deduction (order delivered) and logs the movement. */
  async deductStock(tx: PrismaTx, productId: string, quantity: number, orderId: string): Promise<void> {
    const inventory = await tx.inventory.update({
      where: { productId },
      data: {
        totalStock: { decrement: quantity },
        reservedStock: { decrement: quantity },
      },
    });

    await tx.stockMovement.create({
      data: {
        inventoryId: inventory.id,
        productId,
        type: StockMovementType.OUT,
        quantity: -quantity,
        previousStock: inventory.totalStock + quantity,
        currentStock: inventory.totalStock,
        referenceId: orderId,
        remarks: `Order ${orderId} fulfilled`,
      },
    });

    await this.syncProductStatus(tx, productId, inventory.totalStock);
  }

  private toEntity(row: {
    id: string;
    productId: string;
    totalStock: number;
    reservedStock: number;
    availableStock: number;
    lowStockThreshold: number;
    updatedAt: Date;
    product: { name: string; sku: string };
  }): InventoryEntity {
    return {
      id: row.id,
      productId: row.productId,
      productName: row.product.name,
      sku: row.product.sku,
      totalStock: row.totalStock,
      reservedStock: row.reservedStock,
      availableStock: row.availableStock,
      lowStockThreshold: row.lowStockThreshold,
      updatedAt: row.updatedAt,
    };
  }
}
