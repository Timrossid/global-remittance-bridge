import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] || request.query['apiKey'];

    if (!apiKey || typeof apiKey !== 'string') {
      throw new UnauthorizedException('API key is required');
    }

    const keyRecord = await this.prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { merchant: true },
    });

    if (!keyRecord || !keyRecord.merchant) {
      throw new UnauthorizedException('Invalid API key');
    }

    request.user = {
      userId: keyRecord.merchantId,
      email: keyRecord.merchant.email,
      role: 'MERCHANT',
      apiKey: true,
    };

    return true;
  }
}
