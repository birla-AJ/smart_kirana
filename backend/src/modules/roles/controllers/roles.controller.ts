import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { QueryRoleDto } from '../dto/query-role.dto';
import { AssignPermissionsDto } from '../dto/assign-permissions.dto';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Roles')
@ApiBearerAuth('access-token')
@Roles(UserRoleType.SUPER_ADMIN)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role (SUPER_ADMIN only)' })
  async create(@Body() dto: CreateRoleDto) {
    const data = await this.rolesService.create(dto);
    return { message: 'Role created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List roles with pagination and search' })
  async findAll(@Query() query: QueryRoleDto) {
    const data = await this.rolesService.findAll(query);
    return { message: 'Roles fetched successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role with its permissions and user count' })
  async findOne(@Param('id') id: string) {
    const data = await this.rolesService.findOne(id);
    return { message: 'Role fetched successfully', data };
  }

  @Patch(':id')
  @ApiOperation({ summary: "Update a role's description" })
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    const data = await this.rolesService.update(id, dto);
    return { message: 'Role updated successfully', data };
  }

  @Put(':id/permissions')
  @ApiOperation({ summary: 'Replace the full permission set assigned to a role' })
  async assignPermissions(@Param('id') id: string, @Body() dto: AssignPermissionsDto) {
    const data = await this.rolesService.assignPermissions(id, dto);
    return { message: 'Permissions assigned successfully', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a role (only if no users are assigned to it)' })
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(id);
    return { message: 'Role deleted successfully', data: null };
  }
}
