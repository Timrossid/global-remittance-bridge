import { IsString, IsNumber, IsOptional, IsUUID, Min, IsPositive, MaxLength, Matches } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @MaxLength(3)
  currency: string;

  @IsUUID()
  merchantId: string;

  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsUUID()
  senderId?: string;

  @IsOptional()
  @IsUUID()
  receiverId?: string;
}

export class TransferDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @MaxLength(12)
  asset: string;

  @IsOptional()
  @IsString()
  @MaxLength(56)
  assetIssuer?: string;
}

export class EscrowDto {
  @IsString()
  @Matches(/^G[A-Z0-9]{55}$/)
  senderAddress: string;

  @IsString()
  @Matches(/^C[A-Z0-9]{55}$|^G[A-Z0-9]{55}$/)
  tokenAddress: string;

  @IsNumber()
  @Min(1)
  amount: number;
}

export class UpdateStatusDto {
  @IsString()
  status: string;
}
