import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Coupon, CouponType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { QueryCouponDto } from '../dto/query-coupon.dto';
import { buildPaginatedResponse } from '../../../common/utils/paginate.util';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { CouponEntity, CouponValidationResultEntity } from '../entities/coupon.entity';

type PrismaTx = Prisma.TransactionClient;

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(coupon: Coupon): CouponEntity {
    return {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      value: Number(coupon.value),
      minimumOrderAmount: Number(coupon.minimumOrderAmount),
      maximumDiscount: coupon.maximumDiscount !== null ? Number(coupon.maximumDiscount) : null,
      usageLimit: coupon.usageLimit,
      usedCount: coupon.usedCount,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      isActive: coupon.isActive,
    };
  }

  async create(dto: CreateCouponDto): Promise<CouponEntity> {
    const existing = await this.prisma.coupon.findUnique({ where: { code: dto.code.toUpperCase() } });
    if (existing) throw new ConflictException(`Coupon code "${dto.code}" already exists`);

    const coupon = await this.prisma.coupon.create({
      data: { ...dto, code: dto.code.toUpperCase(), startDate: new Date(dto.startDate), endDate: new Date(dto.endDate) },
    });
    return this.toEntity(coupon);
  }

  async findAll(query: QueryCouponDto): Promise<PaginatedResponseDto<CouponEntity>> {
    const where = {
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            OR: [
              { code: { contains: query.search, mode: 'insensitive' as const } },
              { name: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [data, totalItems] = await this.prisma.$transaction([
      this.prisma.coupon.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' },
      }),
      this.prisma.coupon.count({ where }),
    ]);

    return buildPaginatedResponse(data.map((c) => this.toEntity(c)), totalItems, query.page ?? 1, query.take);
  }

  async findOne(id: string): Promise<CouponEntity> {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException(`Coupon with id "${id}" not found`);
    return this.toEntity(coupon);
  }

  async update(id: string, dto: UpdateCouponDto): Promise<CouponEntity> {
    await this.findOne(id);
    const coupon = await this.prisma.coupon.update({
      where: { id },
      data: {
        ...dto,
        code: dto.code ? dto.code.toUpperCase() : undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
    return this.toEntity(coupon);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.coupon.delete({ where: { id } });
  }

  /**
   * Validates a coupon against an order amount and returns the discount
   * it would produce, without consuming a usage slot. Also used
   * internally by OrdersService (with `tx`) right before an order is
   * placed, immediately followed by `incrementUsage` in the same
   * transaction.
   */
  async validate(
    code: string,
    orderAmount: number,
    client: PrismaTx | PrismaService = this.prisma,
  ): Promise<CouponValidationResultEntity> {
    const coupon = await client.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) throw new NotFoundException(`Coupon "${code}" not found`);

    const now = new Date();

    if (!coupon.isActive) throw new BadRequestException('This coupon is no longer active');
    if (now < coupon.startDate) throw new BadRequestException('This coupon is not active yet');
    if (now > coupon.endDate) throw new BadRequestException('This coupon has expired');
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('This coupon has reached its usage limit');
    }
    if (orderAmount < Number(coupon.minimumOrderAmount)) {
      throw new BadRequestException(
        `Minimum order amount of ${Number(coupon.minimumOrderAmount)} required for this coupon`,
      );
    }

    let discountAmount =
      coupon.type === CouponType.FLAT ? Number(coupon.value) : (orderAmount * Number(coupon.value)) / 100;

    if (coupon.maximumDiscount !== null) {
      discountAmount = Math.min(discountAmount, Number(coupon.maximumDiscount));
    }
    discountAmount = Math.min(discountAmount, orderAmount);

    return { valid: true, discountAmount, coupon: this.toEntity(coupon) };
  }

  /** Called by OrdersService, inside the same transaction as order creation. */
  async incrementUsage(tx: PrismaTx, couponId: string): Promise<void> {
    await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } });
  }
}
