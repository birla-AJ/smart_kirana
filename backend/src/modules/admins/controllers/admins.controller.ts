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
import { AdminsService } from '../services/admins.service';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { QueryAdminDto } from '../dto/query-admin.dto';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Admins')
@ApiBearerAuth('access-token')
@Roles(UserRoleType.SUPER_ADMIN)
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new admin / super-admin user (SUPER_ADMIN only)' })
  async create(@Body() dto: CreateAdminDto) {
    const data = await this.adminsService.create(dto);
    return { message: 'Admin created successfully', data };
  }

  @Get()
  @ApiOperation({ summary: 'List admin users with pagination and search' })
  async findAll(@Query() query: QueryAdminDto) {
    const data = await this.adminsService.findAll(query);
    return { message: 'Admins fetched successfully', data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single admin by id' })
  async findOne(@Param('id') id: string) {
    const data = await this.adminsService.findOne(id);
    return { message: 'Admin fetched successfully', data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an admin profile / designation / employee code' })
  async update(@Param('id') id: string, @Body() dto: UpdateAdminDto) {
    const data = await this.adminsService.update(id, dto);
    return { message: 'Admin updated successfully', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an admin user' })
  async remove(@Param('id') id: string) {
    await this.adminsService.remove(id);
    return { message: 'Admin deleted successfully', data: null };
  }
}
