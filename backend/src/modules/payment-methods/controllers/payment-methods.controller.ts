import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { PaymentMethodsService } from '../services/payment-methods.service';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '../dto/update-payment-method.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Payment Method')
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List available payment methods (pass activeOnly=true for checkout)' })
  async findAll(@Query('activeOnly') activeOnly?: string) {
    const data = await this.paymentMethodsService.findAll(activeOnly === 'true');
    return { message: 'Payment methods fetched successfully', data };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a payment method by id' })
  async findOne(@Param('id') id: string) {
    const data = await this.paymentMethodsService.findOne(id);
    return { message: 'Payment method fetched successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a payment method (SUPER_ADMIN only)' })
  async create(@Body() dto: CreatePaymentMethodDto) {
    const data = await this.paymentMethodsService.create(dto);
    return { message: 'Payment method created successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a payment method (SUPER_ADMIN only)' })
  async update(@Param('id') id: string, @Body() dto: UpdatePaymentMethodDto) {
    const data = await this.paymentMethodsService.update(id, dto);
    return { message: 'Payment method updated successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payment method (SUPER_ADMIN only)' })
  async remove(@Param('id') id: string) {
    await this.paymentMethodsService.remove(id);
    return { message: 'Payment method deleted successfully', data: null };
  }
}
