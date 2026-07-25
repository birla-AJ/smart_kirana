import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { InventoryService } from '../services/inventory.service';
import { AdjustStockDto } from '../dto/adjust-stock.dto';
import { QueryInventoryDto } from '../dto/query-inventory.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Inventory')
@ApiBearerAuth('access-token')
@Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'List stock levels across products, optionally low-stock only' })
  async findAll(@Query() query: QueryInventoryDto) {
    const data = await this.inventoryService.findAll(query);
    return { message: 'Inventory fetched successfully', data };
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get stock level for a single product' })
  async findOne(@Param('productId') productId: string) {
    const data = await this.inventoryService.findOne(productId);
    return { message: 'Inventory fetched successfully', data };
  }

  @Get(':productId/movements')
  @ApiOperation({ summary: 'Stock movement (ledger) history for a product' })
  async getMovements(@Param('productId') productId: string, @Query() query: PaginationQueryDto) {
    const data = await this.inventoryService.getMovementHistory(productId, query);
    return { message: 'Stock movements fetched successfully', data };
  }

  @Post(':productId/adjust')
  @ApiOperation({ summary: 'Manually adjust stock (IN / OUT / ADJUSTMENT)' })
  async adjustStock(@Param('productId') productId: string, @Body() dto: AdjustStockDto) {
    const data = await this.inventoryService.adjustStock(productId, dto);
    return { message: 'Stock adjusted successfully', data };
  }
}
