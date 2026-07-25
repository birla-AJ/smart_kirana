import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { AdminsModule } from './modules/admins/admins.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SubCategoriesModule } from './modules/subcategories/subcategories.module';
import { BrandsModule } from './modules/brands/brands.module';
import { ProductUnitsModule } from './modules/product-units/product-units.module';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CartModule } from './modules/cart/cart.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { OffersModule } from './modules/offers/offers.module';
import { BannersModule } from './modules/banners/banners.module';
import { DeliverySlotsModule } from './modules/delivery-slots/delivery-slots.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { SettingsModule } from './modules/settings/settings.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { ReportsModule } from './modules/reports/reports.module';
import { UploadModule } from './modules/upload/upload.module';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import otpConfig from './config/otp.config';
import paymentConfig from './config/payment.config';
import emailConfig from './config/email.config';
import firebaseConfig from './config/firebase.config';
import s3Config from './config/s3.config';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, otpConfig, paymentConfig, emailConfig, firebaseConfig, s3Config],
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100 }],
    }),
    PrismaModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    UsersModule,
    CustomersModule,
    AdminsModule,
    DashboardModule,
    CategoriesModule,
    SubCategoriesModule,
    BrandsModule,
    ProductUnitsModule,
    ProductsModule,
    InventoryModule,
    CartModule,
    WishlistModule,
    CouponsModule,
    OffersModule,
    BannersModule,
    DeliverySlotsModule,
    PaymentMethodsModule,
    SettingsModule,
    OrdersModule,
    PaymentsModule,
    NotificationsModule,
    ReviewsModule,
    AuditLogsModule,
    ReportsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
