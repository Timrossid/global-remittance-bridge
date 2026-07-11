import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaService } from '../common/prisma.service';
import { StellarService } from '../common/stellar.service';
import { NotificationService } from '../notifications/notification.service';
import { SorobanModule } from '../common/soroban.module';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService, StellarService, NotificationService],
  imports: [SorobanModule],
  exports: [PaymentService],
})
export class PaymentModule {}

