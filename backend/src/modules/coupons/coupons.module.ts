import { Module } from '@nestjs/common';
import { CouponsController } from './controllers/coupons.controller';
import { CouponsService } from './services/coupons.service';

@Module({
  controllers: [CouponsController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
