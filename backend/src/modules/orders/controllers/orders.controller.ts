import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { CancelOrderDto } from '../dto/cancel-order.dto';
import { QueryOrderDto } from '../dto/query-order.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';
import { CustomersService } from '../../customers/services/customers.service';

@ApiTags('Order')
@ApiBearerAuth('access-token')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly customersService: CustomersService,
  ) {}

  private async customerId(user: AuthenticatedUser): Promise<string> {
    const customer = await this.customersService.findByUserId(user.id);
    return customer.id;
  }

  @Roles(UserRoleType.CUSTOMER)
  @Post()
  @ApiOperation({ summary: "Place an order from the logged-in customer's cart" })
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateOrderDto) {
    const data = await this.ordersService.createOrder(await this.customerId(user), dto);
    return { message: 'Order placed successfully', data };
  }

  @Roles(UserRoleType.CUSTOMER)
  @Get('me')
  @ApiOperation({ summary: "List the logged-in customer's orders" })
  async findMine(@CurrentUser() user: AuthenticatedUser, @Query() query: PaginationQueryDto) {
    const data = await this.ordersService.findAllForCustomer(await this.customerId(user), query);
    return { message: 'Orders fetched successfully', data };
  }

  @Roles(UserRoleType.CUSTOMER)
  @Get('me/:id')
  @ApiOperation({ summary: 'Get one of the logged-in customer\'s orders by id' })
  async findMineOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const data = await this.ordersService.findOne(id, await this.customerId(user));
    return { message: 'Order fetched successfully', data };
  }

  @Roles(UserRoleType.CUSTOMER)
  @Patch('me/:id/cancel')
  @ApiOperation({ summary: 'Cancel one of your own orders (only before it is packed)' })
  async cancelMine(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ) {
    const data = await this.ordersService.cancelOrder(id, await this.customerId(user), dto);
    return { message: 'Order cancelled successfully', data };
  }

  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Get()
  @ApiOperation({ summary: 'List all orders with filters (admin)' })
  async findAll(@Query() query: QueryOrderDto) {
    const data = await this.ordersService.findAll(query);
    return { message: 'Orders fetched successfully', data };
  }

  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get any order by id (admin)' })
  async findOne(@Param('id') id: string) {
    const data = await this.ordersService.findOne(id);
    return { message: 'Order fetched successfully', data };
  }

  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Move an order through its status timeline (admin)' })
  async updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const data = await this.ordersService.updateStatus(id, dto, user.id);
    return { message: 'Order status updated successfully', data };
  }
}
