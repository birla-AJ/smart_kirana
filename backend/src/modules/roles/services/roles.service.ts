import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { QueryRoleDto } from '../dto/query-role.dto';
import { AssignPermissionsDto } from '../dto/assign-permissions.dto';
import { buildPaginatedResponse } from '../../../common/utils/paginate.util';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { RoleEntity, RoleWithPermissionsEntity } from '../entities/role.entity';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto): Promise<RoleEntity> {
    const existing = await this.prisma.role.findUnique({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException(`Role "${dto.name}" already exists`);
    }
    return this.prisma.role.create({ data: dto });
  }

  async findAll(query: QueryRoleDto): Promise<PaginatedResponseDto<RoleEntity>> {
    const where = query.search
      ? { description: { contains: query.search, mode: 'insensitive' as const } }
      : {};

    const [data, totalItems] = await this.prisma.$transaction([
      this.prisma.role.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' },
      }),
      this.prisma.role.count({ where }),
    ]);

    return buildPaginatedResponse(data, totalItems, query.page ?? 1, query.take);
  }

  async findOne(id: string): Promise<RoleWithPermissionsEntity> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with id "${id}" not found`);
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions: role.rolePermissions.map((rp) => rp.permission),
      userCount: role._count.users,
    };
  }

  async update(id: string, dto: UpdateRoleDto): Promise<RoleEntity> {
    await this.ensureExists(id);
    return this.prisma.role.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!role) {
      throw new NotFoundException(`Role with id "${id}" not found`);
    }

    if (role._count.users > 0) {
      throw new BadRequestException(
        `Cannot delete role "${role.name}" because ${role._count.users} user(s) are assigned to it`,
      );
    }

    await this.prisma.role.delete({ where: { id } });
  }

  /**
   * Replaces the full permission set for a role in a single transaction:
   * removes any RolePermission rows no longer wanted, and adds the
   * ones that are missing.
   */
  async assignPermissions(
    roleId: string,
    dto: AssignPermissionsDto,
  ): Promise<RoleWithPermissionsEntity> {
    await this.ensureExists(roleId);

    const permissions = await this.prisma.permission.findMany({
      where: { name: { in: dto.permissionNames } },
    });

    const foundNames = new Set(permissions.map((p) => p.name));
    const missing = dto.permissionNames.filter((name) => !foundNames.has(name));
    if (missing.length > 0) {
      throw new BadRequestException(`Unknown permission name(s): ${missing.join(', ')}`);
    }

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId } }),
      this.prisma.rolePermission.createMany({
        data: permissions.map((permission) => ({ roleId, permissionId: permission.id })),
      }),
    ]);

    return this.findOne(roleId);
  }

  private async ensureExists(id: string): Promise<void> {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with id "${id}" not found`);
    }
  }
}
