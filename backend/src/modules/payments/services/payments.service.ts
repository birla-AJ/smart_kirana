import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { createHmac } from 'crypto';
import { OrderStatus, PaymentMethodType, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { RazorpayOrderEntity } from '../entities/payment.entity';
import { VerifyPaymentDto } from '../dto/verify-payment.dto';

const RAZORPAY_ELIGIBLE_METHODS: PaymentMethodType[] = [
  PaymentMethodType.UPI,
  PaymentMethodType.CARD,
  PaymentMethodType.NET_BANKING,
];

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private authHeader(): string {
    const keyId = this.configService.get<string>('payment.razorpayKeyId');
    const keySecret = this.configService.get<string>('payment.razorpayKeySecret');
    return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
  }

  async createRazorpayOrder(orderId: string, customerId?: string): Promise<RazorpayOrderEntity> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: { include: { method: true } } },
    });
    if (!order) throw new NotFoundException(`Order with id "${orderId}" not found`);
    if (customerId && order.customerId !== customerId) {
      throw new BadRequestException('This order does not belong to you');
    }
    if (!order.payment || !RAZORPAY_ELIGIBLE_METHODS.includes(order.payment.method.type)) {
      throw new BadRequestException('This order is not payable through the online gateway');
    }
    if (order.paymentStatus === PaymentStatus.SUCCESS) {
      throw new BadRequestException('This order has already been paid');
    }

    const keyId = this.configService.get<string>('payment.razorpayKeyId');
    const amountInPaise = Math.round(Number(order.total) * 100);

    if (!keyId || !this.configService.get<string>('payment.razorpayKeySecret')) {
      // Development fallback so checkout can be exercised end-to-end
      // without live Razorpay credentials configured.
      this.logger.warn('Razorpay credentials not configured; returning a mock gateway order.');
      const mockGatewayOrderId = `order_mock_${order.orderNumber}`;
      await this.prisma.payment.update({
        where: { orderId },
        data: { gatewayOrderId: mockGatewayOrderId },
      });
      return { gatewayOrderId: mockGatewayOrderId, amount: amountInPaise, currency: 'INR', keyId: keyId ?? '' };
    }

    const response = await axios.post(
      'https://api.razorpay.com/v1/orders',
      { amount: amountInPaise, currency: 'INR', receipt: order.orderNumber },
      { headers: { Authorization: this.authHeader(), 'Content-Type': 'application/json' }, timeout: 10000 },
    );

    await this.prisma.payment.update({
      where: { orderId },
      data: { gatewayOrderId: response.data.id },
    });

    return { gatewayOrderId: response.data.id, amount: amountInPaise, currency: 'INR', keyId };
  }

  async verifyPayment(dto: VerifyPaymentDto, customerId?: string): Promise<{ verified: true }> {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { payment: true },
    });
    if (!order || !order.payment) throw new NotFoundException(`Order with id "${dto.orderId}" not found`);
    if (customerId && order.customerId !== customerId) {
      throw new BadRequestException('This order does not belong to you');
    }

    const keySecret = this.configService.get<string>('payment.razorpayKeySecret');
    const expectedSignature = createHmac('sha256', keySecret ?? '')
      .update(`${dto.razorpayOrderId}|${dto.razorpayPaymentId}`)
      .digest('hex');

    if (!keySecret) {
      this.logger.warn('Razorpay key secret not configured; accepting payment verification in dev mode.');
    } else if (expectedSignature !== dto.razorpaySignature) {
      await this.prisma.payment.update({
        where: { orderId: dto.orderId },
        data: { status: PaymentStatus.FAILED, failureReason: 'Signature verification failed' },
      });
      throw new BadRequestException('Payment signature verification failed');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId: dto.orderId },
        data: {
          status: PaymentStatus.SUCCESS,
          gatewayPaymentId: dto.razorpayPaymentId,
          gatewaySignature: dto.razorpaySignature,
          transactionId: dto.razorpayPaymentId,
          paidAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: dto.orderId },
        data: {
          paymentStatus: PaymentStatus.SUCCESS,
          status: order.status === OrderStatus.PENDING ? OrderStatus.CONFIRMED : undefined,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: dto.orderId,
          status: order.status === OrderStatus.PENDING ? OrderStatus.CONFIRMED : order.status,
          remarks: 'Payment received online',
        },
      });
    });

    return { verified: true };
  }

  /** Verifies and processes a Razorpay webhook event using the raw request body. */
  async handleWebhook(rawBody: Buffer, signatureHeader: string | undefined): Promise<void> {
    const webhookSecret = this.configService.get<string>('payment.razorpayWebhookSecret');
    if (webhookSecret) {
      const expected = createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
      if (expected !== signatureHeader) {
        throw new BadRequestException('Invalid webhook signature');
      }
    } else {
      this.logger.warn('Razorpay webhook secret not configured; skipping signature verification.');
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    const eventType = event.event as string;
    const gatewayPaymentId = event.payload?.payment?.entity?.id as string | undefined;
    const gatewayOrderId = event.payload?.payment?.entity?.order_id as string | undefined;

    if (!gatewayOrderId) return;

    const payment = await this.prisma.payment.findFirst({ where: { gatewayOrderId } });
    if (!payment) return;

    if (eventType === 'payment.captured' && payment.status !== PaymentStatus.SUCCESS) {
      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.SUCCESS, gatewayPaymentId, paidAt: new Date() },
        }),
        this.prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: PaymentStatus.SUCCESS },
        }),
      ]);
    } else if (eventType === 'payment.failed') {
      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.FAILED, failureReason: 'Payment failed at gateway' },
        }),
        this.prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: PaymentStatus.FAILED },
        }),
      ]);
    }
  }

  /** Admin marks a Cash-on-Delivery payment as collected. */
  async confirmCod(orderId: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
      include: { method: true },
    });
    if (!payment) throw new NotFoundException(`Payment for order "${orderId}" not found`);
    if (payment.method.type !== PaymentMethodType.CASH) {
      throw new BadRequestException('This order was not placed with Cash on Delivery');
    }

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { orderId },
        data: { status: PaymentStatus.SUCCESS, paidAt: new Date() },
      }),
      this.prisma.order.update({ where: { id: orderId }, data: { paymentStatus: PaymentStatus.SUCCESS } }),
    ]);
  }

  async getByOrderId(orderId: string, customerId?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId }, include: { order: true } });
    if (!payment) throw new NotFoundException(`Payment for order "${orderId}" not found`);
    if (customerId && payment.order.customerId !== customerId) {
      throw new BadRequestException('This order does not belong to you');
    }
    return {
      id: payment.id,
      orderId: payment.orderId,
      transactionId: payment.transactionId,
      gatewayOrderId: payment.gatewayOrderId,
      gatewayPaymentId: payment.gatewayPaymentId,
      amount: Number(payment.amount),
      status: payment.status,
      paidAt: payment.paidAt,
      failureReason: payment.failureReason,
    };
  }
}
