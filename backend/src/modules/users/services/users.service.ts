import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { QueryUserDto } from '../dto/query-user.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { buildPaginatedResponse } from '../../../common/utils/paginate.util';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { UserEntity } from '../entities/user.entity';

type UserWithRole = User & { role: { name: UserEntity['role'] } };

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(user: UserWithRole): UserEntity {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      mobile: user.mobile,
      email: user.email,
      status: user.status,
      mobileVerified: user.mobileVerified,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      roleId: user.roleId,
      role: user.role.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findAll(query: QueryUserDto): Promise<PaginatedResponseDto<UserEntity>> {
    const where: Prisma.UserWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.role ? { role: { name: query.role } } : {}),
      ...(query.search
        ? {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
              { mobile: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: { role: true },
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return buildPaginatedResponse(
      rows.map((row) => this.toEntity(row)),
      totalItems,
      query.page ?? 1,
      query.take,
    );
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return this.toEntity(user);
  }

  async updateProfile(id: string, dto: UpdateUserProfileDto): Promise<UserEntity> {
    await this.ensureExists(id);

    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException('This email is already in use by another account');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      include: { role: true },
    });
    return this.toEntity(user);
  }

  async updateStatus(id: string, dto: UpdateUserStatusDto): Promise<UserEntity> {
    await this.ensureExists(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
      include: { role: true },
    });
    return this.toEntity(user);
  }

  async updateRole(id: string, dto: UpdateUserRoleDto): Promise<UserEntity> {
    await this.ensureExists(id);

    const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
    if (!role) {
      throw new BadRequestException(`Role with id "${dto.roleId}" not found`);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: { roleId: dto.roleId },
      include: { role: true },
    });
    return this.toEntity(user);
  }

  async remove(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.prisma.user.delete({ where: { id } });
  }

  private async ensureExists(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
  }
}
