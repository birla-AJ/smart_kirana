import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { DeliverySlotsService } from '../services/delivery-slots.service';
import { CreateDeliverySlotDto } from '../dto/create-delivery-slot.dto';
import { UpdateDeliverySlotDto } from '../dto/update-delivery-slot.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Delivery Slot')
@Controller('delivery-slots')
export class DeliverySlotsController {
  constructor(private readonly deliverySlotsService: DeliverySlotsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List delivery slots (pass activeOnly=true for checkout)' })
  async findAll(@Query('activeOnly') activeOnly?: string) {
    const data = await this.deliverySlotsService.findAll(activeOnly === 'true');
    return { message: 'Delivery slots fetched successfully', data };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a delivery slot by id' })
  async findOne(@Param('id') id: string) {
    const data = await this.deliverySlotsService.findOne(id);
    return { message: 'Delivery slot fetched successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a delivery slot (admin)' })
  async create(@Body() dto: CreateDeliverySlotDto) {
    const data = await this.deliverySlotsService.create(dto);
    return { message: 'Delivery slot created successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a delivery slot (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateDeliverySlotDto) {
    const data = await this.deliverySlotsService.update(id, dto);
    return { message: 'Delivery slot updated successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a delivery slot (admin, only if no active orders)' })
  async remove(@Param('id') id: string) {
    await this.deliverySlotsService.remove(id);
    return { message: 'Delivery slot deleted successfully', data: null };
  }
}
