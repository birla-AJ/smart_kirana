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
import { CouponsService } from '../services/coupons.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { QueryCouponDto } from '../dto/query-coupon.dto';
import { ValidateCouponDto } from '../dto/validate-coupon.dto';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Coupon')
@ApiBearerAuth('access-token')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Roles(UserRoleType.CUSTOMER)
  @Post('validate')
  @ApiOperation({ summary: 'Validate a coupon code against the current cart amount' })
  async validate(@Body() dto: ValidateCouponDto) {
    const data = await this.couponsService.validate(dto.code, dto.orderAmount);
    return { message: 'Coupon is valid', data };
  }

  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Get()
  @ApiOperation({ summary: 'List coupons (admin)' })
  async findAll(@Query() query: QueryCouponDto) {
    const data = await this.couponsService.findAll(query);
    return { message: 'Coupons fetched successfully', data };
  }

  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get a coupon by id (admin)' })
  async findOne(@Param('id') id: string) {
    const data = await this.couponsService.findOne(id);
    return { message: 'Coupon fetched successfully', data };
  }

  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a coupon (admin)' })
  async create(@Body() dto: CreateCouponDto) {
    const data = await this.couponsService.create(dto);
    return { message: 'Coupon created successfully', data };
  }

  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a coupon (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    const data = await this.couponsService.update(id, dto);
    return { message: 'Coupon updated successfully', data };
  }

  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a coupon (admin)' })
  async remove(@Param('id') id: string) {
    await this.couponsService.remove(id);
    return { message: 'Coupon deleted successfully', data: null };
  }
}
