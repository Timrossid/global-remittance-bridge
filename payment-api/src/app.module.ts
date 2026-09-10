import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from './common/prisma.service';
import { StellarService } from './common/stellar.service';
import { SorobanService } from './common/soroban.service';
import { MerchantModule } from './merchants/merchant.module';
import { PaymentModule } from './payments/payment.module';
import { AnchorModule } from './anchors/anchor.module';
import { NotificationModule } from './notifications/notification.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';

@Module({
  imports: [
    HttpModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || '',
      signOptions: { expiresIn: '7d' },
    }),
    AuthModule,
    MerchantModule,
    PaymentModule,
    AnchorModule,
    NotificationModule,
    FeedbackModule,
  ],
  providers: [
    PrismaService,
    StellarService,
    SorobanService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [PrismaService, StellarService, SorobanService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware, RateLimitMiddleware)
      .forRoutes('*');
  }
}
