import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { QueryPermissionDto } from '../dto/query-permission.dto';
import { buildPaginatedResponse } from '../../../common/utils/paginate.util';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { PermissionEntity } from '../entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePermissionDto): Promise<PermissionEntity> {
    const existing = await this.prisma.permission.findUnique({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException(`Permission "${dto.name}" already exists`);
    }
    return this.prisma.permission.create({ data: dto });
  }

  async findAll(query: QueryPermissionDto): Promise<PaginatedResponseDto<PermissionEntity>> {
    const where: Prisma.PermissionWhereInput = {
      ...(query.module ? { module: query.module } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { module: { contains: query.search, mode: 'insensitive' } },
              { action: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, totalItems] = await this.prisma.$transaction([
      this.prisma.permission.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' },
      }),
      this.prisma.permission.count({ where }),
    ]);

    return buildPaginatedResponse(data, totalItems, query.page ?? 1, query.take);
  }

  async findOne(id: string): Promise<PermissionEntity> {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    if (!permission) {
      throw new NotFoundException(`Permission with id "${id}" not found`);
    }
    return permission;
  }

  async update(id: string, dto: UpdatePermissionDto): Promise<PermissionEntity> {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.permission.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(`Permission "${dto.name}" already exists`);
      }
    }

    return this.prisma.permission.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.permission.delete({ where: { id } });
  }

  /** Grouped by module — handy for building an admin permission matrix UI. */
  async findAllGroupedByModule(): Promise<Record<string, PermissionEntity[]>> {
    const permissions = await this.prisma.permission.findMany({ orderBy: { module: 'asc' } });
    return permissions.reduce<Record<string, PermissionEntity[]>>((acc, permission) => {
      acc[permission.module] = acc[permission.module] ?? [];
      acc[permission.module].push(permission);
      return acc;
    }, {});
  }
}
