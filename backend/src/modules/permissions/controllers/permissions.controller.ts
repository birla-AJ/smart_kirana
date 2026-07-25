import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { PermissionsService } from '../services/permissions.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { QueryPermissionDto } from '../dto/query-permission.dto';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Permissions')
@ApiBearerAuth('access-token')
@Roles(UserRoleType.SUPER_ADMIN)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new permission (SUPER_ADMIN only)' })
  async create(@Body() dto: CreatePermissionDto) {
    const data = await this.permissionsService.create(dto);
    return { message: 'Permission created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List permissions with pagination, search and module filter' })
  async findAll(@Query() query: QueryPermissionDto) {
    const data = await this.permissionsService.findAll(query);
    return { message: 'Permissions fetched successfully', data };
  }

  @Get('grouped')
  @ApiOperation({ summary: 'List all permissions grouped by module' })
  async findAllGrouped() {
    const data = await this.permissionsService.findAllGroupedByModule();
    return { message: 'Permissions fetched successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single permission by id' })
  async findOne(@Param('id') id: string) {
    const data = await this.permissionsService.findOne(id);
    return { message: 'Permission fetched successfully', data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a permission' })
  async update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    const data = await this.permissionsService.update(id, dto);
    return { message: 'Permission updated successfully', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a permission' })
  async remove(@Param('id') id: string) {
    await this.permissionsService.remove(id);
    return { message: 'Permission deleted successfully', data: null };
  }
}
