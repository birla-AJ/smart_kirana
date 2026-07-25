import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ReviewStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewStatusDto } from '../dto/update-review-status.dto';
import { QueryReviewDto } from '../dto/query-review.dto';
import { buildPaginatedResponse } from '../../../common/utils/paginate.util';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { ProductRatingSummaryEntity, ReviewEntity } from '../entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(review: {
    id: string;
    customerId: string;
    productId: string;
    rating: number;
    title: string | null;
    comment: string | null;
    status: ReviewStatus;
    createdAt: Date;
    customer: { user: { firstName: string; lastName: string | null } };
  }): ReviewEntity {
    return {
      id: review.id,
      customerId: review.customerId,
      customerName: `${review.customer.user.firstName} ${review.customer.user.lastName ?? ''}`.trim(),
      productId: review.productId,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      status: review.status,
      createdAt: review.createdAt,
    };
  }

  async create(customerId: string, dto: CreateReviewDto): Promise<ReviewEntity> {
    const purchased = await this.prisma.orderItem.findFirst({
      where: { productId: dto.productId, order: { customerId } },
    });
    if (!purchased) {
      throw new BadRequestException('You can only review products you have ordered');
    }

    const review = await this.prisma.review.upsert({
      where: { customerId_productId: { customerId, productId: dto.productId } },
      update: { rating: dto.rating, title: dto.title, comment: dto.comment, status: ReviewStatus.PENDING },
      create: {
        customerId,
        productId: dto.productId,
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
      },
      include: { customer: { include: { user: true } } },
    });

    return this.toEntity(review);
  }

  async findAllForProduct(productId: string, query: QueryReviewDto): Promise<PaginatedResponseDto<ReviewEntity>> {
    const where = { productId, status: ReviewStatus.APPROVED };
    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        include: { customer: { include: { user: true } } },
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);
    return buildPaginatedResponse(rows.map((r) => this.toEntity(r)), totalItems, query.page ?? 1, query.take);
  }

  async getProductRatingSummary(productId: string): Promise<ProductRatingSummaryEntity> {
    const aggregate = await this.prisma.review.aggregate({
      where: { productId, status: ReviewStatus.APPROVED },
      _avg: { rating: true },
      _count: true,
    });
    return {
      productId,
      averageRating: Math.round((aggregate._avg.rating ?? 0) * 10) / 10,
      totalReviews: aggregate._count,
    };
  }

  async findAllAdmin(query: QueryReviewDto): Promise<PaginatedResponseDto<ReviewEntity>> {
    const where = {
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };
    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        include: { customer: { include: { user: true } } },
        skip: query.skip,
        take: query.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where }),
    ]);
    return buildPaginatedResponse(rows.map((r) => this.toEntity(r)), totalItems, query.page ?? 1, query.take);
  }

  async updateStatus(id: string, dto: UpdateReviewStatusDto): Promise<ReviewEntity> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: { customer: { include: { user: true } } },
    });
    if (!review) throw new NotFoundException(`Review with id "${id}" not found`);

    const updated = await this.prisma.review.update({
      where: { id },
      data: { status: dto.status },
      include: { customer: { include: { user: true } } },
    });
    return this.toEntity(updated);
  }

  async remove(customerId: string, id: string): Promise<void> {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException(`Review with id "${id}" not found`);
    if (review.customerId !== customerId) throw new ForbiddenException('This review does not belong to you');
    await this.prisma.review.delete({ where: { id } });
  }
}
