import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from './common/prisma.service';
import { StellarService } from './common/stellar.service';
import { SorobanService } from './common/soroban.service';
import { MerchantModule } from './merchants/merchant.module';
import { PaymentModule } from './payments/payment.module';
import { AnchorModule } from './anchors/anchor.module';
import { NotificationModule } from './notifications/notification.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/jwt.strategy';

/**
 * Root application module for the Payment API.
 * Orchestrates all core modules and services.
 */
@Module({
  imports: [
    HttpModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecretkey123',
      signOptions: { expiresIn: '1d' },
    }),
    MerchantModule,
    PaymentModule,
    AnchorModule,
    NotificationModule,
  ],
  providers: [PrismaService, StellarService, SorobanService, JwtStrategy],
  exports: [PrismaService, StellarService, SorobanService],
})
export class AppModule {}
