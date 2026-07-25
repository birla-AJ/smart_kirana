import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { ProductUnitsService } from '../services/product-units.service';
import { CreateProductUnitDto } from '../dto/create-product-unit.dto';
import { UpdateProductUnitDto } from '../dto/update-product-unit.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Product Unit')
@Controller('product-units')
export class ProductUnitsController {
  constructor(private readonly productUnitsService: ProductUnitsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all product units' })
  async findAll() {
    const data = await this.productUnitsService.findAll();
    return { message: 'Product units fetched successfully', data };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a product unit by id' })
  async findOne(@Param('id') id: string) {
    const data = await this.productUnitsService.findOne(id);
    return { message: 'Product unit fetched successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a product unit (admin)' })
  async create(@Body() dto: CreateProductUnitDto) {
    const data = await this.productUnitsService.create(dto);
    return { message: 'Product unit created successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product unit (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductUnitDto) {
    const data = await this.productUnitsService.update(id, dto);
    return { message: 'Product unit updated successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product unit (admin, only if unused)' })
  async remove(@Param('id') id: string) {
    await this.productUnitsService.remove(id);
    return { message: 'Product unit deleted successfully', data: null };
  }
}
