import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SorobanService } from './soroban.service';

@Module({
  imports: [HttpModule],
  providers: [SorobanService],
  exports: [SorobanService],
})
export class SorobanModule {}
