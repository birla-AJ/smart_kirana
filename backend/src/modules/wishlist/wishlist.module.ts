import { Module } from '@nestjs/common';
import { WishlistController } from './controllers/wishlist.controller';
import { WishlistService } from './services/wishlist.service';
import { CustomersModule } from '../customers/customers.module';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [CustomersModule, CartModule],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}
