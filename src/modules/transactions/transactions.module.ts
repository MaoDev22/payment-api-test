import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TransactionsService } from './transactions.service';
import { Transaction } from './transaction.entity';
import { TransactionDetail } from './transaction-detail.entity';
import { User } from '@app/modules/users/user.entity';
import { TransactionsController } from './transactions.controller';
import { Product } from '@app/modules/products/product.entity';
import { AuthModule } from '@app/modules/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Transaction]),
    TypeOrmModule.forFeature([TransactionDetail]),
    TypeOrmModule.forFeature([Product]),
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
        signOptions: { expiresIn: configService.get<string>('EXPIRES_IN') },
      }),
    }),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})

export class TransactionsModule {}
