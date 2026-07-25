import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Customer, Gender, User } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto';
import { QueryCustomerDto } from '../dto/query-customer.dto';
import { buildPaginatedResponse } from '../../../common/utils/paginate.util';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { CustomerEntity } from '../entities/customer.entity';

type CustomerWithUser = Customer & { user: User };

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(customer: CustomerWithUser): CustomerEntity {
    return {
      id: customer.id,
      userId: customer.userId,
      firstName: customer.user.firstName,
      lastName: customer.user.lastName,
      mobile: customer.user.mobile,
      email: customer.user.email,
      gender: customer.user.gender as Gender | null,
      referralCode: customer.referralCode,
      totalOrders: customer.totalOrders,
      totalSpent: Number(customer.totalSpent),
      loyaltyPoints: customer.loyaltyPoints,
      walletBalance: Number(customer.walletBalance),
      createdAt: customer.createdAt,
    };
  }

  async findAll(query: QueryCustomerDto): Promise<PaginatedResponseDto<CustomerEntity>> {
    const where = query.search
      ? {
          user: {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' as const } },
              { lastName: { contains: query.search, mode: 'insensitive' as const } },
              { mobile: { contains: query.search, mode: 'insensitive' as const } },
              { email: { contains: query.search, mode: 'insensitive' as const } },
            ],
          },
        }
      : {};

    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        include: { user: true },
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return buildPaginatedResponse(
      rows.map((r) => this.toEntity(r)),
      totalItems,
      query.page ?? 1,
      query.take,
    );
  }

  async findByUserId(userId: string): Promise<CustomerEntity> {
    const customer = await this.prisma.customer.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!customer) {
      throw new NotFoundException('Customer profile not found');
    }
    return this.toEntity(customer);
  }

  async findOne(id: string): Promise<CustomerEntity> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!customer) {
      throw new NotFoundException(`Customer with id "${id}" not found`);
    }
    return this.toEntity(customer);
  }

  async updateProfile(userId: string, dto: UpdateCustomerProfileDto): Promise<CustomerEntity> {
    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id: userId } },
      });
      if (existing) {
        throw new ConflictException('This email is already in use by another account');
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        gender: dto.gender,
      },
    });

    return this.findByUserId(userId);
  }
}
