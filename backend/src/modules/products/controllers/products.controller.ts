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
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { QueryProductDto } from '../dto/query-product.dto';
import { ProductImageDto } from '../dto/product-image.dto';
import { ProductVariantDto } from '../dto/product-variant.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Product')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List products with filters, search and pagination (storefront)' })
  async findAll(@Query() query: QueryProductDto) {
    const data = await this.productsService.findAll(query);
    return { message: 'Products fetched successfully', data };
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a product by slug (storefront)' })
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.productsService.findBySlug(slug);
    return { message: 'Product fetched successfully', data };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  async findOne(@Param('id') id: string) {
    const data = await this.productsService.findOne(id);
    return { message: 'Product fetched successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a product with variants, images and initial stock (admin)' })
  async create(@Body() dto: CreateProductDto) {
    const data = await this.productsService.create(dto);
    return { message: 'Product created successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update product details (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const data = await this.productsService.update(id, dto);
    return { message: 'Product updated successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product (admin, only if never ordered)' })
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
    return { message: 'Product deleted successfully', data: null };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Post(':id/images')
  @ApiOperation({ summary: 'Add an image to a product (admin)' })
  async addImage(@Param('id') id: string, @Body() dto: ProductImageDto) {
    const data = await this.productsService.addImage(id, dto);
    return { message: 'Image added successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Patch(':id/images/:imageId/set-primary')
  @ApiOperation({ summary: 'Mark an image as the primary product image (admin)' })
  async setPrimaryImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    const data = await this.productsService.setPrimaryImage(id, imageId);
    return { message: 'Primary image updated successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Delete(':id/images/:imageId')
  @ApiOperation({ summary: 'Remove a product image (admin)' })
  async removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    const data = await this.productsService.removeImage(id, imageId);
    return { message: 'Image removed successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Post(':id/variants')
  @ApiOperation({ summary: 'Add a variant to a product (admin)' })
  async addVariant(@Param('id') id: string, @Body() dto: ProductVariantDto) {
    const data = await this.productsService.addVariant(id, dto);
    return { message: 'Variant added successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Put(':id/variants/:variantId')
  @ApiOperation({ summary: 'Update a product variant (admin)' })
  async updateVariant(
    @Param('id') id: string,
    @Param('variantId') variantId: string,
    @Body() dto: Partial<ProductVariantDto>,
  ) {
    const data = await this.productsService.updateVariant(id, variantId, dto);
    return { message: 'Variant updated successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Delete(':id/variants/:variantId')
  @ApiOperation({ summary: 'Remove a product variant (admin, product must keep at least one)' })
  async removeVariant(@Param('id') id: string, @Param('variantId') variantId: string) {
    const data = await this.productsService.removeVariant(id, variantId);
    return { message: 'Variant removed successfully', data };
  }
}
