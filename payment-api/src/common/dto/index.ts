import { IsString, IsNotEmpty, IsUUID, IsNumber, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsUUID()
  merchantId!: string;

  @IsUUID()
  customerId!: string;
}

export class CreateEscrowPaymentDto {
  @IsString()
  @IsNotEmpty()
  senderAddress!: string;

  @IsUUID()
  merchantId!: string;

  @IsString()
  @IsNotEmpty()
  tokenAddress!: string;

  @IsNumber()
  @Min(1, { message: 'Amount must be at least 1 stroop' })
  amount!: number;
}

export class UpdateTransactionStatusDto {
  @IsString()
  @IsNotEmpty()
  status!: string;
}

export class MerchantQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
