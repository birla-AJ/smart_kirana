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
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { QueryCategoryDto } from '../dto/query-category.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Category')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List categories (public storefront + admin)' })
  async findAll(@Query() query: QueryCategoryDto) {
    const data = await this.categoriesService.findAll(query);
    return { message: 'Categories fetched successfully', data };
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a category by slug (storefront)' })
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.categoriesService.findBySlug(slug);
    return { message: 'Category fetched successfully', data };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a category by id' })
  async findOne(@Param('id') id: string) {
    const data = await this.categoriesService.findOne(id);
    return { message: 'Category fetched successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a category (admin)' })
  async create(@Body() dto: CreateCategoryDto) {
    const data = await this.categoriesService.create(dto);
    return { message: 'Category created successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a category (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const data = await this.categoriesService.update(id, dto);
    return { message: 'Category updated successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category (admin, only if empty)' })
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
    return { message: 'Category deleted successfully', data: null };
  }
}
