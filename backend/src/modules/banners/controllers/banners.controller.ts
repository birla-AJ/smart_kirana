import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { BannersService } from '../services/banners.service';
import { CreateBannerDto } from '../dto/create-banner.dto';
import { UpdateBannerDto } from '../dto/update-banner.dto';
import { QueryBannerDto } from '../dto/query-banner.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Banner')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List banners, optionally filtered by type' })
  async findAll(@Query() query: QueryBannerDto) {
    const data = await this.bannersService.findAll(query);
    return { message: 'Banners fetched successfully', data };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a banner by id' })
  async findOne(@Param('id') id: string) {
    const data = await this.bannersService.findOne(id);
    return { message: 'Banner fetched successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a banner (admin)' })
  async create(@Body() dto: CreateBannerDto) {
    const data = await this.bannersService.create(dto);
    return { message: 'Banner created successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a banner (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    const data = await this.bannersService.update(id, dto);
    return { message: 'Banner updated successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a banner (admin)' })
  async remove(@Param('id') id: string) {
    await this.bannersService.remove(id);
    return { message: 'Banner deleted successfully', data: null };
  }
}
