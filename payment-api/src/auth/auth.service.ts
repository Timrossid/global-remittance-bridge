import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    const computed = crypto.createHmac('sha256', salt).update(password).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(hash, 'hex'));
  }

  private issueToken(merchantId: string, email: string, role: string) {
    const payload = { sub: merchantId, email, role };
    return {
      access_token: this.jwtService.sign(payload),
      merchant_id: merchantId,
    };
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(48).toString('hex');
  }

  async createRefreshToken(userId: string): Promise<string> {
    const token = this.generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  async refreshAccessToken(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: stored.userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const merchant = await this.prisma.merchant.findUnique({
      where: { email: user.email },
    });

    if (!merchant) {
      throw new UnauthorizedException('Merchant profile not found');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    const newRefreshToken = await this.createRefreshToken(user.id);

    return {
      ...this.issueToken(merchant.id, merchant.email, user.role),
      refresh_token: newRefreshToken,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        email: merchant.email,
        walletAddress: merchant.walletAddress,
        kycStatus: merchant.kycStatus,
      },
    };
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    walletAddress: string;
  }) {
    const existing = await this.prisma.merchant.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const walletExists = await this.prisma.merchant.findUnique({
      where: { walletAddress: data.walletAddress },
    });
    if (walletExists) {
      throw new ConflictException('A merchant with this wallet address already exists');
    }

    const hashedPassword = this.hashPassword(data.password);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: 'MERCHANT',
      },
    });

    const merchant = await this.prisma.merchant.create({
      data: {
        name: data.name,
        email: data.email,
        walletAddress: data.walletAddress,
        kycStatus: 'PENDING',
      },
    });

    const refreshToken = await this.createRefreshToken(user.id);

    return {
      ...this.issueToken(merchant.id, merchant.email, 'MERCHANT'),
      refresh_token: refreshToken,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        email: merchant.email,
        walletAddress: merchant.walletAddress,
        kycStatus: merchant.kycStatus,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = this.verifyPassword(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const merchant = await this.prisma.merchant.findUnique({ where: { email } });
    if (!merchant) {
      throw new UnauthorizedException('No merchant profile found for this account');
    }

    const refreshToken = await this.createRefreshToken(user.id);

    return {
      ...this.issueToken(merchant.id, merchant.email, user.role),
      refresh_token: refreshToken,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        email: merchant.email,
        walletAddress: merchant.walletAddress,
        kycStatus: merchant.kycStatus,
      },
    };
  }
}
