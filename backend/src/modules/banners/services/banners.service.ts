import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateBannerDto } from '../dto/create-banner.dto';
import { UpdateBannerDto } from '../dto/update-banner.dto';
import { QueryBannerDto } from '../dto/query-banner.dto';
import { buildPaginatedResponse } from '../../../common/utils/paginate.util';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { BannerEntity } from '../entities/banner.entity';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBannerDto): Promise<BannerEntity> {
    return this.prisma.banner.create({
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async findAll(query: QueryBannerDto): Promise<PaginatedResponseDto<BannerEntity>> {
    const where = { ...(query.type ? { type: query.type } : {}) };

    const [data, totalItems] = await this.prisma.$transaction([
      this.prisma.banner.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy ?? 'sortOrder']: query.sortOrder ?? 'asc' },
      }),
      this.prisma.banner.count({ where }),
    ]);

    return buildPaginatedResponse(data, totalItems, query.page ?? 1, query.take);
  }

  async findOne(id: string): Promise<BannerEntity> {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException(`Banner with id "${id}" not found`);
    return banner;
  }

  async update(id: string, dto: UpdateBannerDto): Promise<BannerEntity> {
    await this.findOne(id);
    return this.prisma.banner.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.banner.delete({ where: { id } });
  }
}
