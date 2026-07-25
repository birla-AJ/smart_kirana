import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { WishlistService } from '../services/wishlist.service';
import { AddWishlistItemDto } from '../dto/add-wishlist-item.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';
import { CustomersService } from '../../customers/services/customers.service';

@ApiTags('Wishlist')
@ApiBearerAuth('access-token')
@Roles(UserRoleType.CUSTOMER)
@Controller('wishlist')
export class WishlistController {
  constructor(
    private readonly wishlistService: WishlistService,
    private readonly customersService: CustomersService,
  ) {}

  private async customerId(user: AuthenticatedUser): Promise<string> {
    const customer = await this.customersService.findByUserId(user.id);
    return customer.id;
  }

  @Get()
  @ApiOperation({ summary: "Get the logged-in customer's wishlist" })
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.wishlistService.findAll(await this.customerId(user));
    return { message: 'Wishlist fetched successfully', data };
  }

  @Post()
  @ApiOperation({ summary: 'Add a product to the wishlist' })
  async add(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddWishlistItemDto) {
    const data = await this.wishlistService.add(await this.customerId(user), dto.productId);
    return { message: 'Added to wishlist successfully', data };
  }

  @Post(':productId/move-to-cart')
  @ApiOperation({ summary: 'Move a wishlist item into the cart' })
  async moveToCart(@CurrentUser() user: AuthenticatedUser, @Param('productId') productId: string) {
    const data = await this.wishlistService.moveToCart(await this.customerId(user), productId);
    return { message: 'Moved to cart successfully', data };
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove a product from the wishlist' })
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('productId') productId: string) {
    const data = await this.wishlistService.remove(await this.customerId(user), productId);
    return { message: 'Removed from wishlist successfully', data };
  }
}
