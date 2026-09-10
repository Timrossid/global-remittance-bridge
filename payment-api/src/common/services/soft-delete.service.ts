import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class SoftDeleteService {
  constructor(private readonly prisma: PrismaService) {}

  async softDelete(model: string, id: string) {
    const modelMap: Record<string, any> = {
      merchant: this.prisma.merchant,
      customer: this.prisma.customer,
      user: this.prisma.user,
    };

    const prismaModel = modelMap[model.toLowerCase()];
    if (!prismaModel) {
      throw new BadRequestException(`Model ${model} does not support soft delete`);
    }

    const existing = await prismaModel.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`${model} not found`);
    }

    if ((existing as any).deletedAt) {
      throw new BadRequestException(`${model} is already deleted`);
    }

    return prismaModel.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(model: string, id: string) {
    const modelMap: Record<string, any> = {
      merchant: this.prisma.merchant,
      customer: this.prisma.customer,
      user: this.prisma.user,
    };

    const prismaModel = modelMap[model.toLowerCase()];
    if (!prismaModel) {
      throw new BadRequestException(`Model ${model} does not support restore`);
    }

    const existing = await prismaModel.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`${model} not found`);
    }

    if (!(existing as any).deletedAt) {
      throw new BadRequestException(`${model} is not deleted`);
    }

    return prismaModel.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async findDeleted(model: string) {
    const modelMap: Record<string, any> = {
      merchant: this.prisma.merchant,
      customer: this.prisma.customer,
      user: this.prisma.user,
    };

    const prismaModel = modelMap[model.toLowerCase()];
    if (!prismaModel) {
      throw new BadRequestException(`Model ${model} does not support soft delete`);
    }

    return prismaModel.findMany({
      where: { deletedAt: { not: null } },
    });
  }
}
