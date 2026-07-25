import { Module } from '@nestjs/common';
import { DeliverySlotsController } from './controllers/delivery-slots.controller';
import { DeliverySlotsService } from './services/delivery-slots.service';

@Module({
  controllers: [DeliverySlotsController],
  providers: [DeliverySlotsService],
  exports: [DeliverySlotsService],
})
export class DeliverySlotsModule {}
