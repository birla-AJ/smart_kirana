import { Injectable, NotFoundException } from '@nestjs/common';
import { Offer } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateOfferDto } from '../dto/create-offer.dto';
import { UpdateOfferDto } from '../dto/update-offer.dto';
import { QueryOfferDto } from '../dto/query-offer.dto';
import { buildPaginatedResponse } from '../../../common/utils/paginate.util';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { OfferEntity } from '../entities/offer.entity';

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(offer: Offer): OfferEntity {
    return {
      id: offer.id,
      title: offer.title,
      description: offer.description,
      type: offer.type,
      value: Number(offer.value),
      image: offer.image,
      startDate: offer.startDate,
      endDate: offer.endDate,
      isActive: offer.isActive,
    };
  }

  async create(dto: CreateOfferDto): Promise<OfferEntity> {
    const offer = await this.prisma.offer.create({
      data: { ...dto, startDate: new Date(dto.startDate), endDate: new Date(dto.endDate) },
    });
    return this.toEntity(offer);
  }

  async findAll(query: QueryOfferDto): Promise<PaginatedResponseDto<OfferEntity>> {
    const now = new Date();
    const where = {
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.activeNow ? { isActive: true, startDate: { lte: now }, endDate: { gte: now } } : {}),
      ...(query.search ? { title: { contains: query.search, mode: 'insensitive' as const } } : {}),
    };

    const [data, totalItems] = await this.prisma.$transaction([
      this.prisma.offer.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' },
      }),
      this.prisma.offer.count({ where }),
    ]);

    return buildPaginatedResponse(data.map((o) => this.toEntity(o)), totalItems, query.page ?? 1, query.take);
  }

  async findOne(id: string): Promise<OfferEntity> {
    const offer = await this.prisma.offer.findUnique({ where: { id } });
    if (!offer) throw new NotFoundException(`Offer with id "${id}" not found`);
    return this.toEntity(offer);
  }

  async update(id: string, dto: UpdateOfferDto): Promise<OfferEntity> {
    await this.findOne(id);
    const offer = await this.prisma.offer.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
    return this.toEntity(offer);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.offer.delete({ where: { id } });
  }
}
