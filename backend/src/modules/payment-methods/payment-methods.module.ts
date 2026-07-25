import { Module } from '@nestjs/common';
import { PaymentMethodsController } from './controllers/payment-methods.controller';
import { PaymentMethodsService } from './services/payment-methods.service';

@Module({
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService],
  exports: [PaymentMethodsService],
})
export class PaymentMethodsModule {}
