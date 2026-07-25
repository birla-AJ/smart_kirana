import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Admin, User, UserRoleType, UserStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { QueryAdminDto } from '../dto/query-admin.dto';
import { buildPaginatedResponse } from '../../../common/utils/paginate.util';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { AdminEntity } from '../entities/admin.entity';

type AdminWithUser = Admin & { user: User & { role: { name: UserRoleType } } };

@Injectable()
export class AdminsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private toEntity(admin: AdminWithUser): AdminEntity {
    return {
      id: admin.id,
      userId: admin.userId,
      firstName: admin.user.firstName,
      lastName: admin.user.lastName,
      email: admin.user.email!,
      mobile: admin.user.mobile,
      role: admin.user.role.name,
      status: admin.user.status,
      designation: admin.designation,
      employeeCode: admin.employeeCode,
      createdAt: admin.createdAt,
    };
  }

  async create(dto: CreateAdminDto): Promise<AdminEntity> {
    const [existingEmail, existingMobile] = await Promise.all([
      this.prisma.user.findUnique({ where: { email: dto.email } }),
      this.prisma.user.findUnique({ where: { mobile: dto.mobile } }),
    ]);
    if (existingEmail) throw new ConflictException('An account with this email already exists');
    if (existingMobile) throw new ConflictException('An account with this mobile number already exists');

    const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
    if (!role || (role.name !== UserRoleType.ADMIN && role.name !== UserRoleType.SUPER_ADMIN)) {
      throw new BadRequestException('roleId must reference the ADMIN or SUPER_ADMIN role');
    }

    if (dto.employeeCode) {
      const existingCode = await this.prisma.admin.findUnique({ where: { employeeCode: dto.employeeCode } });
      if (existingCode) throw new ConflictException('This employee code is already in use');
    }

    const rounds = this.configService.get<number>('app.bcryptSaltRounds') ?? 10;
    const hashedPassword = await bcrypt.hash(dto.password, rounds);

    const admin = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          mobile: dto.mobile,
          password: hashedPassword,
          status: UserStatus.ACTIVE,
          emailVerified: true,
          roleId: dto.roleId,
        },
      });

      return tx.admin.create({
        data: {
          userId: user.id,
          designation: dto.designation,
          employeeCode: dto.employeeCode,
        },
        include: { user: { include: { role: true } } },
      });
    });

    return this.toEntity(admin);
  }

  async findAll(query: QueryAdminDto): Promise<PaginatedResponseDto<AdminEntity>> {
    const where = query.search
      ? {
          user: {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' as const } },
              { lastName: { contains: query.search, mode: 'insensitive' as const } },
              { email: { contains: query.search, mode: 'insensitive' as const } },
            ],
          },
        }
      : {};

    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.admin.findMany({
        where,
        include: { user: { include: { role: true } } },
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' },
      }),
      this.prisma.admin.count({ where }),
    ]);

    return buildPaginatedResponse(
      rows.map((r) => this.toEntity(r)),
      totalItems,
      query.page ?? 1,
      query.take,
    );
  }

  async findOne(id: string): Promise<AdminEntity> {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      include: { user: { include: { role: true } } },
    });
    if (!admin) {
      throw new NotFoundException(`Admin with id "${id}" not found`);
    }
    return this.toEntity(admin);
  }

  async update(id: string, dto: UpdateAdminDto): Promise<AdminEntity> {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) {
      throw new NotFoundException(`Admin with id "${id}" not found`);
    }

    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id: admin.userId } },
      });
      if (existing) throw new ConflictException('This email is already in use by another account');
    }

    if (dto.employeeCode) {
      const existing = await this.prisma.admin.findFirst({
        where: { employeeCode: dto.employeeCode, NOT: { id } },
      });
      if (existing) throw new ConflictException('This employee code is already in use');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: admin.userId },
        data: { firstName: dto.firstName, lastName: dto.lastName, email: dto.email },
      });
      return tx.admin.update({
        where: { id },
        data: { designation: dto.designation, employeeCode: dto.employeeCode },
        include: { user: { include: { role: true } } },
      });
    });

    return this.toEntity(updated);
  }

  async remove(id: string): Promise<void> {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) {
      throw new NotFoundException(`Admin with id "${id}" not found`);
    }
    // Cascades to the underlying User row (onDelete: Cascade on Admin.user).
    await this.prisma.user.delete({ where: { id: admin.userId } });
  }
}
