import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { QueryBrandDto } from '../dto/query-brand.dto';
import { buildPaginatedResponse } from '../../../common/utils/paginate.util';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { BrandEntity } from '../entities/brand.entity';
import { slugify, withUniqueSuffix } from '../../../common/utils/slugify.util';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateUniqueSlug(name: string): Promise<string> {
    let slug = slugify(name);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await this.prisma.brand.findUnique({ where: { slug } });
      if (!existing) return slug;
      slug = withUniqueSuffix(slugify(name));
    }
  }

  async create(dto: CreateBrandDto): Promise<BrandEntity> {
    const slug = await this.generateUniqueSlug(dto.name);
    return this.prisma.brand.create({ data: { ...dto, slug } });
  }

  async findAll(query: QueryBrandDto): Promise<PaginatedResponseDto<BrandEntity>> {
    const where = query.search
      ? { name: { contains: query.search, mode: 'insensitive' as const } }
      : {};

    const [data, totalItems] = await this.prisma.$transaction([
      this.prisma.brand.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' },
      }),
      this.prisma.brand.count({ where }),
    ]);

    return buildPaginatedResponse(data, totalItems, query.page ?? 1, query.take);
  }

  async findOne(id: string): Promise<BrandEntity> {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException(`Brand with id "${id}" not found`);
    return brand;
  }

  async update(id: string, dto: UpdateBrandDto): Promise<BrandEntity> {
    await this.findOne(id);
    return this.prisma.brand.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!brand) throw new NotFoundException(`Brand with id "${id}" not found`);
    if (brand._count.products > 0) {
      throw new ConflictException('Cannot delete a brand that still has products');
    }
    await this.prisma.brand.delete({ where: { id } });
  }
}
