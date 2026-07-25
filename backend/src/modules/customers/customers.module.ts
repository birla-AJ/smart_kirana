import { Module } from '@nestjs/common';
import { CustomersController } from './controllers/customers.controller';
import { AddressesController } from './controllers/addresses.controller';
import { WalletController } from './controllers/wallet.controller';
import { CustomersService } from './services/customers.service';
import { AddressesService } from './services/addresses.service';
import { WalletService } from './services/wallet.service';

@Module({
  controllers: [CustomersController, AddressesController, WalletController],
  providers: [CustomersService, AddressesService, WalletService],
  exports: [CustomersService, AddressesService, WalletService],
})
export class CustomersModule {}
