import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { CustomersService } from '../services/customers.service';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto';
import { QueryCustomerDto } from '../dto/query-customer.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';

@ApiTags('Customers')
@ApiBearerAuth('access-token')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Roles(UserRoleType.CUSTOMER)
  @Get('me')
  @ApiOperation({ summary: "Get the logged-in customer's profile" })
  async me(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.customersService.findByUserId(user.id);
    return { message: 'Profile fetched successfully', data };
  }

  @Roles(UserRoleType.CUSTOMER)
  @Patch('me')
  @ApiOperation({ summary: "Update the logged-in customer's profile" })
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    const data = await this.customersService.updateProfile(user.id, dto);
    return { message: 'Profile updated successfully', data };
  }

  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Get()
  @ApiOperation({ summary: 'List all customers (admin)' })
  async findAll(@Query() query: QueryCustomerDto) {
    const data = await this.customersService.findAll(query);
    return { message: 'Customers fetched successfully', data };
  }

  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get a single customer by id (admin)' })
  async findOne(@Param('id') id: string) {
    const data = await this.customersService.findOne(id);
    return { message: 'Customer fetched successfully', data };
  }
}
