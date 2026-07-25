import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { CartService } from '../services/cart.service';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';
import { CustomersService } from '../../customers/services/customers.service';

@ApiTags('Cart')
@ApiBearerAuth('access-token')
@Roles(UserRoleType.CUSTOMER)
@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly customersService: CustomersService,
  ) {}

  private async customerId(user: AuthenticatedUser): Promise<string> {
    const customer = await this.customersService.findByUserId(user.id);
    return customer.id;
  }

  @Get()
  @ApiOperation({ summary: "Get the logged-in customer's cart" })
  async getCart(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.cartService.getCart(await this.customerId(user));
    return { message: 'Cart fetched successfully', data };
  }

  @Post('items')
  @ApiOperation({ summary: 'Add a product (and optional variant) to the cart' })
  async addItem(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddCartItemDto) {
    const data = await this.cartService.addItem(await this.customerId(user), dto);
    return { message: 'Item added to cart successfully', data };
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update the quantity of a cart item (0 removes it)' })
  async updateItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const data = await this.cartService.updateItem(await this.customerId(user), itemId, dto);
    return { message: 'Cart updated successfully', data };
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  async removeItem(@CurrentUser() user: AuthenticatedUser, @Param('itemId') itemId: string) {
    const data = await this.cartService.removeItem(await this.customerId(user), itemId);
    return { message: 'Item removed from cart successfully', data };
  }

  @Delete()
  @ApiOperation({ summary: 'Clear the entire cart' })
  async clearCart(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.cartService.clearCart(await this.customerId(user));
    return { message: 'Cart cleared successfully', data };
  }
}
