import { Controller, Get, Post, Body, UseGuards, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateFeedbackDto } from './dto/feedback.dto';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateFeedbackDto, @Request() req: any) {
    const merchantId = req.user?.userId ?? null;
    return this.feedbackService.create(dto, merchantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.feedbackService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async stats() {
    return this.feedbackService.stats();
  }
}
