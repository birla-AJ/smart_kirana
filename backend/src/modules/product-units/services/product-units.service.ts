import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateProductUnitDto } from '../dto/create-product-unit.dto';
import { UpdateProductUnitDto } from '../dto/update-product-unit.dto';
import { ProductUnitEntity } from '../entities/product-unit.entity';

@Injectable()
export class ProductUnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductUnitDto): Promise<ProductUnitEntity> {
    return this.prisma.productUnit.create({ data: dto });
  }

  async findAll(): Promise<ProductUnitEntity[]> {
    return this.prisma.productUnit.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string): Promise<ProductUnitEntity> {
    const unit = await this.prisma.productUnit.findUnique({ where: { id } });
    if (!unit) throw new NotFoundException(`Product unit with id "${id}" not found`);
    return unit;
  }

  async update(id: string, dto: UpdateProductUnitDto): Promise<ProductUnitEntity> {
    await this.findOne(id);
    return this.prisma.productUnit.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    const unit = await this.prisma.productUnit.findUnique({
      where: { id },
      include: { _count: { select: { productVariants: true } } },
    });
    if (!unit) throw new NotFoundException(`Product unit with id "${id}" not found`);
    if (unit._count.productVariants > 0) {
      throw new ConflictException('Cannot delete a unit that is used by product variants');
    }
    await this.prisma.productUnit.delete({ where: { id } });
  }
}
