import { Module } from '@nestjs/common';
import { OffersController } from './controllers/offers.controller';
import { OffersService } from './services/offers.service';

@Module({
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
