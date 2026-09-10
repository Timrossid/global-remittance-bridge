import { Controller, Get, UseGuards, Query, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExportService } from '../common/services/export.service';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async exportTransactions(
    @Request() req,
    @Query('format') format: 'csv' | 'json' | 'xlsx' = 'csv',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    const options = {
      format,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status,
    };

    const data = await this.exportService.exportTransactions(req.user.userId, options);

    if (format === 'csv') {
      return {
        data,
        contentType: 'text/csv',
        filename: `transactions-${Date.now()}.csv`,
      };
    }

    if (format === 'json') {
      return JSON.parse(data);
    }

    return { data };
  }
}
