import { Module } from '@nestjs/common';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { InventoryModule } from '../inventory/inventory.module';
import { CouponsModule } from '../coupons/coupons.module';
import { SettingsModule } from '../settings/settings.module';
import { DeliverySlotsModule } from '../delivery-slots/delivery-slots.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [InventoryModule, CouponsModule, SettingsModule, DeliverySlotsModule, CustomersModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
