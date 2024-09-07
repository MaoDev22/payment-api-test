import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import * as cors from 'cors';

import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { AuthModule } from '@app/modules/auth/auth.module';
import { UsersModule } from '@app/modules/users/users.module';
import { RolesModule } from '@app/modules/roles/roles.module';
import { ProductsModule } from '@app/modules/products/products.module';
import { TransactionsModule } from '@app/modules/transactions/transactions.module';

import { User } from '@app/modules/users/user.entity';
import { Role } from '@app/modules/roles/role.entity';
import { AssignedRole } from '@app/modules/roles/assigned-role.entity';
import { Product } from '@app/modules/products/product.entity';
import { Transaction } from '@app/modules/transactions/transaction.entity';
import { TransactionDetail } from '@app/modules/transactions/transaction-detail.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
      isGlobal: true,
    }),
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.File({ filename: '/var/log/app.log' }),
        new winston.transports.Console(),
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<number>('DB_PORT')),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Role, User, AssignedRole, Product, Transaction, TransactionDetail],
        synchronize: true,
        ssl: configService.get<string>('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false
      }),
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    ProductsModule,
    TransactionsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cors({
          origin: 'http://localhost',
          methods: [RequestMethod.GET],
        }),
      )
      .forRoutes(
        { path: '/metrics', method: RequestMethod.GET },
        { path: '/health-check', method: RequestMethod.GET }
      )
  }
}
