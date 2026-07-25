import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateSubCategoryDto } from '../dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from '../dto/update-subcategory.dto';
import { QuerySubCategoryDto } from '../dto/query-subcategory.dto';
import { buildPaginatedResponse } from '../../../common/utils/paginate.util';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { SubCategoryEntity } from '../entities/subcategory.entity';
import { slugify, withUniqueSuffix } from '../../../common/utils/slugify.util';

@Injectable()
export class SubCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  private async generateUniqueSlug(name: string): Promise<string> {
    let slug = slugify(name);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await this.prisma.subCategory.findUnique({ where: { slug } });
      if (!existing) return slug;
      slug = withUniqueSuffix(slugify(name));
    }
  }

  async create(dto: CreateSubCategoryDto): Promise<SubCategoryEntity> {
    const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category) throw new BadRequestException(`Category with id "${dto.categoryId}" not found`);

    const slug = await this.generateUniqueSlug(dto.name);
    return this.prisma.subCategory.create({ data: { ...dto, slug } });
  }

  async findAll(query: QuerySubCategoryDto): Promise<PaginatedResponseDto<SubCategoryEntity>> {
    const where = {
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' as const } } : {}),
    };

    const [data, totalItems] = await this.prisma.$transaction([
      this.prisma.subCategory.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy ?? 'sortOrder']: query.sortOrder ?? 'asc' },
      }),
      this.prisma.subCategory.count({ where }),
    ]);

    return buildPaginatedResponse(data, totalItems, query.page ?? 1, query.take);
  }

  async findOne(id: string): Promise<SubCategoryEntity> {
    const subCategory = await this.prisma.subCategory.findUnique({ where: { id } });
    if (!subCategory) throw new NotFoundException(`SubCategory with id "${id}" not found`);
    return subCategory;
  }

  async update(id: string, dto: UpdateSubCategoryDto): Promise<SubCategoryEntity> {
    await this.findOne(id);
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!category) throw new BadRequestException(`Category with id "${dto.categoryId}" not found`);
    }
    return this.prisma.subCategory.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    const subCategory = await this.prisma.subCategory.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!subCategory) throw new NotFoundException(`SubCategory with id "${id}" not found`);
    if (subCategory._count.products > 0) {
      throw new ConflictException('Cannot delete a sub-category that still has products');
    }
    await this.prisma.subCategory.delete({ where: { id } });
  }
}
