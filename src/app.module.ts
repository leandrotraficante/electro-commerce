import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module'; 
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { CartModule } from './modules/cart/cart.module';
import { ChatModule } from './modules/chat/chat.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { envConfig } from './config/env.config';


@Module({
  imports: [
    ConfigModule.forRoot({
    isGlobal: true,
    cache: true,
    expandVariables: true,
    load: [envConfig],
  }),
  TypeOrmModule.forRoot({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    autoLoadEntities: true,
    synchronize: true,
    logging: true,
  }),
  UsersModule,
  AuthModule,
  ProductsModule,
  OrdersModule,
  CartModule,
  ChatModule,
  PaymentsModule,
],

})
export class AppModule {}
