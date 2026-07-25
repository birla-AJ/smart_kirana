import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateAddressDto } from '../dto/create-address.dto';
import { UpdateAddressDto } from '../dto/update-address.dto';
import { AddressEntity } from '../entities/address.entity';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(address: {
    id: string;
    customerId: string;
    type: AddressEntity['type'];
    fullName: string;
    mobile: string;
    addressLine1: string;
    addressLine2: string | null;
    landmark: string | null;
    city: string;
    state: string;
    country: string;
    pincode: string;
    latitude: unknown;
    longitude: unknown;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): AddressEntity {
    return {
      ...address,
      latitude: address.latitude !== null ? Number(address.latitude) : null,
      longitude: address.longitude !== null ? Number(address.longitude) : null,
    };
  }

  private async ensureCustomerId(userId: string): Promise<string> {
    const customer = await this.prisma.customer.findUnique({ where: { userId } });
    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }
    return customer.id;
  }

  async findAll(userId: string): Promise<AddressEntity[]> {
    const customerId = await this.ensureCustomerId(userId);
    const addresses = await this.prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return addresses.map((a) => this.toEntity(a));
  }

  async findOne(userId: string, addressId: string): Promise<AddressEntity> {
    const customerId = await this.ensureCustomerId(userId);
    const address = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId },
    });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return this.toEntity(address);
  }

  async create(userId: string, dto: CreateAddressDto): Promise<AddressEntity> {
    const customerId = await this.ensureCustomerId(userId);

    const addressCount = await this.prisma.customerAddress.count({ where: { customerId } });
    const shouldBeDefault = dto.isDefault || addressCount === 0;

    const address = await this.prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.customerAddress.updateMany({
          where: { customerId, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.customerAddress.create({
        data: { ...dto, customerId, isDefault: shouldBeDefault },
      });
    });

    return this.toEntity(address);
  }

  async update(userId: string, addressId: string, dto: UpdateAddressDto): Promise<AddressEntity> {
    const customerId = await this.ensureCustomerId(userId);
    await this.ensureOwnership(customerId, addressId);

    const address = await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.customerAddress.updateMany({
          where: { customerId, isDefault: true, NOT: { id: addressId } },
          data: { isDefault: false },
        });
      }
      return tx.customerAddress.update({ where: { id: addressId }, data: dto });
    });

    return this.toEntity(address);
  }

  async setDefault(userId: string, addressId: string): Promise<AddressEntity> {
    const customerId = await this.ensureCustomerId(userId);
    await this.ensureOwnership(customerId, addressId);

    const address = await this.prisma.$transaction(async (tx) => {
      await tx.customerAddress.updateMany({
        where: { customerId, isDefault: true },
        data: { isDefault: false },
      });
      return tx.customerAddress.update({ where: { id: addressId }, data: { isDefault: true } });
    });

    return this.toEntity(address);
  }

  async remove(userId: string, addressId: string): Promise<void> {
    const customerId = await this.ensureCustomerId(userId);
    const address = await this.ensureOwnership(customerId, addressId);

    await this.prisma.customerAddress.delete({ where: { id: addressId } });

    if (address.isDefault) {
      const nextDefault = await this.prisma.customerAddress.findFirst({
        where: { customerId },
        orderBy: { createdAt: 'asc' },
      });
      if (nextDefault) {
        await this.prisma.customerAddress.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }
  }

  private async ensureOwnership(customerId: string, addressId: string) {
    const address = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId },
    });
    if (!address) {
      throw new BadRequestException('Address not found or does not belong to this customer');
    }
    return address;
  }
}
