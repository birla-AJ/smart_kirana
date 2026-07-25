import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { WalletService } from '../services/wallet.service';
import { CustomersService } from '../services/customers.service';
import { AdjustWalletDto } from '../dto/adjust-wallet.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';

@ApiTags('Customer Wallet')
@ApiBearerAuth('access-token')
@Controller()
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly customersService: CustomersService,
  ) {}

  @Roles(UserRoleType.CUSTOMER)
  @Get('customers/me/wallet')
  @ApiOperation({ summary: "Get the logged-in customer's wallet balance" })
  async getMyBalance(@CurrentUser() user: AuthenticatedUser) {
    const customer = await this.customersService.findByUserId(user.id);
    const data = await this.walletService.getBalance(customer.id);
    return { message: 'Wallet balance fetched successfully', data };
  }

  @Roles(UserRoleType.CUSTOMER)
  @Get('customers/me/wallet/transactions')
  @ApiOperation({ summary: "List the logged-in customer's wallet transaction history" })
  async getMyHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ) {
    const customer = await this.customersService.findByUserId(user.id);
    const data = await this.walletService.getHistory(customer.id, query);
    return { message: 'Wallet history fetched successfully', data };
  }

  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Post('customers/:customerId/wallet/adjust')
  @ApiOperation({ summary: "Credit or debit a customer's wallet (admin)" })
  async adjustBalance(
    @Param('customerId') customerId: string,
    @Body() dto: AdjustWalletDto,
  ) {
    const data = await this.walletService.adjustBalance(customerId, dto, 'ADMIN_ADJUSTMENT');
    return { message: 'Wallet adjusted successfully', data };
  }
}
