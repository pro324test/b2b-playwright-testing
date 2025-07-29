import { Module } from '@nestjs/common';
import { UserAddressService } from './user-address.service';
import { ShopAddressService } from './shop-address.service';
import { AddressController } from './address.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule if needed for authentication

@Module({
  imports: [PrismaModule, AuthModule], // Import PrismaModule and AuthModule if needed
  controllers: [AddressController], // Add the controller here
  providers: [UserAddressService, ShopAddressService],
  exports: [UserAddressService, ShopAddressService],
})
export class AddressModule {}