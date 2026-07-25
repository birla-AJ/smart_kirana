import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { QueryCategoryDto } from '../dto/query-category.dto';
import { CategoryEntity } from '../entities/category.entity';
import { buildPaginatedResponse } from '../../../common/utils/paginate.util';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { slugify, withUniqueSuffix } from '../../../common/utils/slugify.util';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateUniqueSlug(name: string): Promise<string> {
    let slug = slugify(name);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await this.prisma.category.findUnique({ where: { slug } });
      if (!existing) return slug;
      slug = withUniqueSuffix(slugify(name));
    }
  }

  async create(dto: CreateCategoryDto): Promise<CategoryEntity> {
    const slug = await this.generateUniqueSlug(dto.name);
    return this.prisma.category.create({ data: { ...dto, slug } });
  }

  async findAll(query: QueryCategoryDto): Promise<PaginatedResponseDto<CategoryEntity>> {
    const where = {
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' as const } } : {}),
    };

    const [data, totalItems] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy ?? 'sortOrder']: query.sortOrder ?? 'asc' },
      }),
      this.prisma.category.count({ where }),
    ]);

    return buildPaginatedResponse(data, totalItems, query.page ?? 1, query.take);
  }

  async findOne(id: string): Promise<CategoryEntity> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException(`Category with id "${id}" not found`);
    return category;
  }

  async findBySlug(slug: string): Promise<CategoryEntity> {
    const category = await this.prisma.category.findUnique({ where: { slug } });
    if (!category) throw new NotFoundException(`Category "${slug}" not found`);
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryEntity> {
    await this.findOne(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, subCategories: true } } },
    });
    if (!category) throw new NotFoundException(`Category with id "${id}" not found`);

    if (category._count.products > 0 || category._count.subCategories > 0) {
      throw new ConflictException(
        'Cannot delete a category that still has products or sub-categories. Deactivate it instead.',
      );
    }

    await this.prisma.category.delete({ where: { id } });
  }
}
