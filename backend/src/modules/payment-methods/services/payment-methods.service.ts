import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '../dto/update-payment-method.dto';
import { PaymentMethodEntity } from '../entities/payment-method.entity';

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentMethodDto): Promise<PaymentMethodEntity> {
    const existing = await this.prisma.paymentMethod.findUnique({ where: { type: dto.type } });
    if (existing) throw new ConflictException(`Payment method of type "${dto.type}" already exists`);
    return this.prisma.paymentMethod.create({ data: dto });
  }

  async findAll(activeOnly = false): Promise<PaymentMethodEntity[]> {
    return this.prisma.paymentMethod.findMany({ where: activeOnly ? { isActive: true } : undefined });
  }

  async findOne(id: string): Promise<PaymentMethodEntity> {
    const method = await this.prisma.paymentMethod.findUnique({ where: { id } });
    if (!method) throw new NotFoundException(`Payment method with id "${id}" not found`);
    return method;
  }

  async update(id: string, dto: UpdatePaymentMethodDto): Promise<PaymentMethodEntity> {
    await this.findOne(id);
    return this.prisma.paymentMethod.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.paymentMethod.delete({ where: { id } });
  }
}
