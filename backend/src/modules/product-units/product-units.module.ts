import { Module } from '@nestjs/common';
import { ProductUnitsController } from './controllers/product-units.controller';
import { ProductUnitsService } from './services/product-units.service';

@Module({
  controllers: [ProductUnitsController],
  providers: [ProductUnitsService],
  exports: [ProductUnitsService],
})
export class ProductUnitsModule {}
