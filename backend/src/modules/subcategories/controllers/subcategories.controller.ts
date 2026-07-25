import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { SubCategoriesService } from '../services/subcategories.service';
import { CreateSubCategoryDto } from '../dto/create-subcategory.dto';
import { UpdateSubCategoryDto } from '../dto/update-subcategory.dto';
import { QuerySubCategoryDto } from '../dto/query-subcategory.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('SubCategory')
@Controller('subcategories')
export class SubCategoriesController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List sub-categories, optionally filtered by categoryId' })
  async findAll(@Query() query: QuerySubCategoryDto) {
    const data = await this.subCategoriesService.findAll(query);
    return { message: 'Sub-categories fetched successfully', data };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a sub-category by id' })
  async findOne(@Param('id') id: string) {
    const data = await this.subCategoriesService.findOne(id);
    return { message: 'Sub-category fetched successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a sub-category (admin)' })
  async create(@Body() dto: CreateSubCategoryDto) {
    const data = await this.subCategoriesService.create(dto);
    return { message: 'Sub-category created successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a sub-category (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateSubCategoryDto) {
    const data = await this.subCategoriesService.update(id, dto);
    return { message: 'Sub-category updated successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sub-category (admin, only if empty)' })
  async remove(@Param('id') id: string) {
    await this.subCategoriesService.remove(id);
    return { message: 'Sub-category deleted successfully', data: null };
  }
}
