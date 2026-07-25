import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { QueryProductDto } from '../dto/query-product.dto';
import { ProductImageDto } from '../dto/product-image.dto';
import { ProductVariantDto } from '../dto/product-variant.dto';
import { buildPaginatedResponse } from '../../../common/utils/paginate.util';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { ProductEntity } from '../entities/product.entity';
import { slugify, withUniqueSuffix } from '../../../common/utils/slugify.util';

const FULL_INCLUDE = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  variants: { include: { unit: true } },
  inventory: true,
};

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof FULL_INCLUDE }>;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(product: ProductWithRelations): ProductEntity {
    return {
      id: product.id,
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId,
      brandId: product.brandId,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      status: product.status,
      isFeatured: product.isFeatured,
      isVeg: product.isVeg,
      taxPercentage: Number(product.taxPercentage),
      images: product.images.map((i) => ({
        id: i.id,
        imageUrl: i.imageUrl,
        isPrimary: i.isPrimary,
        sortOrder: i.sortOrder,
      })),
      variants: product.variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        mrp: Number(v.mrp),
        sellingPrice: Number(v.sellingPrice),
        discount: Number(v.discount),
        barcode: v.barcode,
        isDefault: v.isDefault,
        unitId: v.unitId,
        unitName: v.unit.name,
        unitShortName: v.unit.shortName,
      })),
      inventory: product.inventory
        ? {
            totalStock: product.inventory.totalStock,
            reservedStock: product.inventory.reservedStock,
            availableStock: product.inventory.availableStock,
            lowStockThreshold: product.inventory.lowStockThreshold,
          }
        : null,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    let slug = slugify(name);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await this.prisma.product.findUnique({ where: { slug } });
      if (!existing) return slug;
      slug = withUniqueSuffix(slugify(name));
    }
  }

  private normalizeDefaultFlag<T extends { isDefault?: boolean }>(items: T[]): T[] {
    const hasDefault = items.some((i) => i.isDefault);
    if (!hasDefault) {
      return items.map((item, index) => ({ ...item, isDefault: index === 0 }));
    }
    let seenDefault = false;
    return items.map((item) => {
      if (item.isDefault && !seenDefault) {
        seenDefault = true;
        return item;
      }
      return { ...item, isDefault: false };
    });
  }

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!category) throw new BadRequestException(`Category with id "${dto.categoryId}" not found`);

    if (dto.subCategoryId) {
      const subCategory = await this.prisma.subCategory.findUnique({ where: { id: dto.subCategoryId } });
      if (!subCategory) throw new BadRequestException(`SubCategory with id "${dto.subCategoryId}" not found`);
    }
    if (dto.brandId) {
      const brand = await this.prisma.brand.findUnique({ where: { id: dto.brandId } });
      if (!brand) throw new BadRequestException(`Brand with id "${dto.brandId}" not found`);
    }

    const existingSku = await this.prisma.product.findUnique({ where: { sku: dto.sku } });
    if (existingSku) throw new ConflictException(`Product SKU "${dto.sku}" already exists`);

    const variantSkus = dto.variants.map((v) => v.sku);
    const existingVariantSkus = await this.prisma.productVariant.findMany({
      where: { sku: { in: variantSkus } },
    });
    if (existingVariantSkus.length > 0) {
      throw new ConflictException(
        `Variant SKU(s) already exist: ${existingVariantSkus.map((v) => v.sku).join(', ')}`,
      );
    }

    for (const variant of dto.variants) {
      const unit = await this.prisma.productUnit.findUnique({ where: { id: variant.unitId } });
      if (!unit) throw new BadRequestException(`Product unit with id "${variant.unitId}" not found`);
    }

    const slug = await this.generateUniqueSlug(dto.name);
    const variants = this.normalizeDefaultFlag<ProductVariantDto>(dto.variants);
    const images = dto.images ? this.normalizeSinglePrimary(dto.images) : [];

    const product = await this.prisma.product.create({
      data: {
        categoryId: dto.categoryId,
        subCategoryId: dto.subCategoryId,
        brandId: dto.brandId,
        name: dto.name,
        slug,
        sku: dto.sku,
        description: dto.description,
        isFeatured: dto.isFeatured ?? false,
        isVeg: dto.isVeg ?? true,
        taxPercentage: dto.taxPercentage ?? 0,
        variants: { create: variants },
        images: images.length > 0 ? { create: images } : undefined,
        inventory: {
          create: {
            totalStock: dto.initialStock ?? 0,
            reservedStock: 0,
            availableStock: dto.initialStock ?? 0,
            lowStockThreshold: dto.lowStockThreshold ?? 10,
          },
        },
      },
      include: FULL_INCLUDE,
    });

    return this.toEntity(product);
  }

  private normalizeSinglePrimary(images: ProductImageDto[]): ProductImageDto[] {
    const hasPrimary = images.some((i) => i.isPrimary);
    if (!hasPrimary) {
      return images.map((img, index) => ({ ...img, isPrimary: index === 0 }));
    }
    let seenPrimary = false;
    return images.map((img) => {
      if (img.isPrimary && !seenPrimary) {
        seenPrimary = true;
        return img;
      }
      return { ...img, isPrimary: false };
    });
  }

  async findAll(query: QueryProductDto): Promise<PaginatedResponseDto<ProductEntity>> {
    const where: Prisma.ProductWhereInput = {
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.subCategoryId ? { subCategoryId: query.subCategoryId } : {}),
      ...(query.brandId ? { brandId: query.brandId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.isFeatured !== undefined ? { isFeatured: query.isFeatured } : {}),
      ...(query.isVeg !== undefined ? { isVeg: query.isVeg } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { sku: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.minPrice !== undefined || query.maxPrice !== undefined
        ? {
            variants: {
              some: {
                sellingPrice: {
                  ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
                  ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
                },
              },
            },
          }
        : {}),
    };

    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: FULL_INCLUDE,
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return buildPaginatedResponse(
      rows.map((r) => this.toEntity(r)),
      totalItems,
      query.page ?? 1,
      query.take,
    );
  }

  async findOne(id: string): Promise<ProductEntity> {
    const product = await this.prisma.product.findUnique({ where: { id }, include: FULL_INCLUDE });
    if (!product) throw new NotFoundException(`Product with id "${id}" not found`);
    return this.toEntity(product);
  }

  async findBySlug(slug: string): Promise<ProductEntity> {
    const product = await this.prisma.product.findUnique({ where: { slug }, include: FULL_INCLUDE });
    if (!product) throw new NotFoundException(`Product "${slug}" not found`);
    return this.toEntity(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductEntity> {
    await this.findOne(id);

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!category) throw new BadRequestException(`Category with id "${dto.categoryId}" not found`);
    }
    if (dto.brandId) {
      const brand = await this.prisma.brand.findUnique({ where: { id: dto.brandId } });
      if (!brand) throw new BadRequestException(`Brand with id "${dto.brandId}" not found`);
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: dto,
      include: FULL_INCLUDE,
    });
    return this.toEntity(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { _count: { select: { orderItems: true } } },
    });
    if (!product) throw new NotFoundException(`Product with id "${id}" not found`);

    if (product._count.orderItems > 0) {
      throw new ConflictException(
        'Cannot delete a product that has been ordered. Set its status to DISCONTINUED instead.',
      );
    }

    await this.prisma.product.delete({ where: { id } });
  }

  // ---------- Images ----------

  async addImage(productId: string, dto: ProductImageDto): Promise<ProductEntity> {
    await this.findOne(productId);

    await this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) {
        await tx.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
      }
      await tx.productImage.create({ data: { ...dto, productId } });
    });

    return this.findOne(productId);
  }

  async setPrimaryImage(productId: string, imageId: string): Promise<ProductEntity> {
    const image = await this.prisma.productImage.findFirst({ where: { id: imageId, productId } });
    if (!image) throw new NotFoundException('Image not found for this product');

    await this.prisma.$transaction([
      this.prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } }),
      this.prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
    ]);

    return this.findOne(productId);
  }

  async removeImage(productId: string, imageId: string): Promise<ProductEntity> {
    const image = await this.prisma.productImage.findFirst({ where: { id: imageId, productId } });
    if (!image) throw new NotFoundException('Image not found for this product');

    await this.prisma.productImage.delete({ where: { id: imageId } });

    if (image.isPrimary) {
      const next = await this.prisma.productImage.findFirst({
        where: { productId },
        orderBy: { sortOrder: 'asc' },
      });
      if (next) {
        await this.prisma.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
      }
    }

    return this.findOne(productId);
  }

  // ---------- Variants ----------

  async addVariant(productId: string, dto: ProductVariantDto): Promise<ProductEntity> {
    await this.findOne(productId);

    const existingSku = await this.prisma.productVariant.findUnique({ where: { sku: dto.sku } });
    if (existingSku) throw new ConflictException(`Variant SKU "${dto.sku}" already exists`);

    const unit = await this.prisma.productUnit.findUnique({ where: { id: dto.unitId } });
    if (!unit) throw new BadRequestException(`Product unit with id "${dto.unitId}" not found`);

    await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.productVariant.updateMany({ where: { productId }, data: { isDefault: false } });
      }
      await tx.productVariant.create({ data: { ...dto, productId } });
    });

    return this.findOne(productId);
  }

  async updateVariant(
    productId: string,
    variantId: string,
    dto: Partial<ProductVariantDto>,
  ): Promise<ProductEntity> {
    const variant = await this.prisma.productVariant.findFirst({ where: { id: variantId, productId } });
    if (!variant) throw new NotFoundException('Variant not found for this product');

    if (dto.sku && dto.sku !== variant.sku) {
      const existingSku = await this.prisma.productVariant.findUnique({ where: { sku: dto.sku } });
      if (existingSku) throw new ConflictException(`Variant SKU "${dto.sku}" already exists`);
    }

    await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.productVariant.updateMany({
          where: { productId, NOT: { id: variantId } },
          data: { isDefault: false },
        });
      }
      await tx.productVariant.update({ where: { id: variantId }, data: dto });
    });

    return this.findOne(productId);
  }

  async removeVariant(productId: string, variantId: string): Promise<ProductEntity> {
    const variant = await this.prisma.productVariant.findFirst({ where: { id: variantId, productId } });
    if (!variant) throw new NotFoundException('Variant not found for this product');

    const variantCount = await this.prisma.productVariant.count({ where: { productId } });
    if (variantCount <= 1) {
      throw new ConflictException('A product must have at least one variant');
    }

    await this.prisma.productVariant.delete({ where: { id: variantId } });

    if (variant.isDefault) {
      const next = await this.prisma.productVariant.findFirst({ where: { productId } });
      if (next) {
        await this.prisma.productVariant.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    }

    return this.findOne(productId);
  }
}
