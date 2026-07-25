import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateDeliverySlotDto } from '../dto/create-delivery-slot.dto';
import { UpdateDeliverySlotDto } from '../dto/update-delivery-slot.dto';
import { DeliverySlotEntity } from '../entities/delivery-slot.entity';

const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.PACKED,
  OrderStatus.OUT_FOR_DELIVERY,
];

@Injectable()
export class DeliverySlotsService {
  constructor(private readonly prisma: PrismaService) {}

  private async toEntity(slot: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    maxOrders: number;
    status: DeliverySlotEntity['status'];
  }): Promise<DeliverySlotEntity> {
    const bookedOrders = await this.prisma.order.count({
      where: { deliverySlotId: slot.id, status: { in: ACTIVE_ORDER_STATUSES } },
    });
    return { ...slot, bookedOrders };
  }

  async create(dto: CreateDeliverySlotDto): Promise<DeliverySlotEntity> {
    const slot = await this.prisma.deliverySlot.create({ data: dto });
    return this.toEntity(slot);
  }

  async findAll(activeOnly = false): Promise<DeliverySlotEntity[]> {
    const slots = await this.prisma.deliverySlot.findMany({
      where: activeOnly ? { status: 'ACTIVE' } : undefined,
      orderBy: { startTime: 'asc' },
    });
    return Promise.all(slots.map((s) => this.toEntity(s)));
  }

  async findOne(id: string): Promise<DeliverySlotEntity> {
    const slot = await this.prisma.deliverySlot.findUnique({ where: { id } });
    if (!slot) throw new NotFoundException(`Delivery slot with id "${id}" not found`);
    return this.toEntity(slot);
  }

  async update(id: string, dto: UpdateDeliverySlotDto): Promise<DeliverySlotEntity> {
    await this.findOne(id);
    const slot = await this.prisma.deliverySlot.update({ where: { id }, data: dto });
    return this.toEntity(slot);
  }

  async remove(id: string): Promise<void> {
    const bookedCount = await this.prisma.order.count({
      where: { deliverySlotId: id, status: { in: ACTIVE_ORDER_STATUSES } },
    });
    if (bookedCount > 0) {
      throw new BadRequestException('Cannot delete a slot with active orders booked against it');
    }
    await this.prisma.deliverySlot.delete({ where: { id } });
  }

  /** Used by OrdersService to confirm a slot still has capacity, inside the order transaction. */
  async assertCapacity(deliverySlotId: string): Promise<void> {
    const slot = await this.prisma.deliverySlot.findUnique({ where: { id: deliverySlotId } });
    if (!slot || slot.status !== 'ACTIVE') {
      throw new BadRequestException('Selected delivery slot is not available');
    }
    const bookedOrders = await this.prisma.order.count({
      where: { deliverySlotId, status: { in: ACTIVE_ORDER_STATUSES } },
    });
    if (bookedOrders >= slot.maxOrders) {
      throw new BadRequestException('Selected delivery slot is fully booked');
    }
  }
}
