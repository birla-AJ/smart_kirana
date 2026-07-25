import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';
import { PaymentsService } from '../services/payments.service';
import { CreateRazorpayOrderDto } from '../dto/create-razorpay-order.dto';
import { VerifyPaymentDto } from '../dto/verify-payment.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../auth/types/authenticated-user.type';
import { CustomersService } from '../../customers/services/customers.service';

@ApiTags('Payment')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly customersService: CustomersService,
  ) {}

  private async customerId(user: AuthenticatedUser): Promise<string> {
    const customer = await this.customersService.findByUserId(user.id);
    return customer.id;
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.CUSTOMER)
  @Post('razorpay/create-order')
  @ApiOperation({ summary: 'Create a Razorpay gateway order for an existing order' })
  async createRazorpayOrder(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateRazorpayOrderDto) {
    const data = await this.paymentsService.createRazorpayOrder(dto.orderId, await this.customerId(user));
    return { message: 'Razorpay order created successfully', data };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.CUSTOMER)
  @Post('razorpay/verify')
  @ApiOperation({ summary: 'Verify a completed Razorpay payment and mark the order paid' })
  async verifyPayment(@CurrentUser() user: AuthenticatedUser, @Body() dto: VerifyPaymentDto) {
    const data = await this.paymentsService.verifyPayment(dto, await this.customerId(user));
    return { message: 'Payment verified successfully', data };
  }

  @Public()
  @Post('razorpay/webhook')
  @ApiOperation({ summary: 'Razorpay server-to-server webhook (signature-verified, not user-authenticated)' })
  async webhook(@Req() req: RawBodyRequest<Request>, @Headers('x-razorpay-signature') signature?: string) {
    await this.paymentsService.handleWebhook(req.rawBody ?? Buffer.from(''), signature);
    return { message: 'Webhook processed', data: null };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Post('cod/:orderId/confirm')
  @ApiOperation({ summary: 'Mark a Cash-on-Delivery order as paid (admin)' })
  async confirmCod(@Param('orderId') orderId: string) {
    await this.paymentsService.confirmCod(orderId);
    return { message: 'COD payment confirmed successfully', data: null };
  }

  @ApiBearerAuth('access-token')
  @Roles(UserRoleType.CUSTOMER, UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Get(':orderId')
  @ApiOperation({ summary: 'Get payment details for an order' })
  async getByOrderId(@CurrentUser() user: AuthenticatedUser, @Param('orderId') orderId: string) {
    const isCustomer = user.role === UserRoleType.CUSTOMER;
    const data = await this.paymentsService.getByOrderId(orderId, isCustomer ? await this.customerId(user) : undefined);
    return { message: 'Payment fetched successfully', data };
  }
}
