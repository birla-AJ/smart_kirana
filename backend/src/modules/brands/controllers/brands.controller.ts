import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { BrandsService } from '../services/brands.service';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { QueryBrandDto } from '../dto/query-brand.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Brand')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List brands' })
  async findAll(@Query() query: QueryBrandDto) {
    const data = await this.brandsService.findAll(query);
    return { message: 'Brands fetched successfully', data };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a brand by id' })
  async findOne(@Param('id') id: string) {
    const data = await this.brandsService.findOne(id);
    return { message: 'Brand fetched successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a brand (admin)' })
  async create(@Body() dto: CreateBrandDto) {
    const data = await this.brandsService.create(dto);
    return { message: 'Brand created successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a brand (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    const data = await this.brandsService.update(id, dto);
    return { message: 'Brand updated successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a brand (admin, only if empty)' })
  async remove(@Param('id') id: string) {
    await this.brandsService.remove(id);
    return { message: 'Brand deleted successfully', data: null };
  }
}
