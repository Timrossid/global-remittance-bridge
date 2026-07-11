import { Module } from '@nestjs/common';
import { AnchorController } from './anchor.controller';
import { AnchorManagerService } from './anchor-manager.service';

@Module({
  controllers: [AnchorController],
  providers: [AnchorManagerService],
  exports: [AnchorManagerService],
})
export class AnchorModule {}
