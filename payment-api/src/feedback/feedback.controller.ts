import { Controller, Get, Post, Body, UseGuards, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { FeedbackService, CreateFeedbackDto } from './feedback.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * POST /feedback
   * Persist a feedback submission. Auth is optional (anonymous testers can
   * submit without an account); when authenticated the merchantId is attached.
   */
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateFeedbackDto, @Request() req: any) {
    const merchantId = req.user?.userId ?? null;
    return this.feedbackService.create(dto, merchantId);
  }

  /**
   * GET /feedback
   * Return all feedback submissions (used by the export tooling).
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.feedbackService.findAll();
  }

  /**
   * GET /feedback/stats
   * Average rating and response count.
   */
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async stats() {
    return this.feedbackService.stats();
  }
}
