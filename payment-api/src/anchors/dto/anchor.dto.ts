import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class QuoteDto {
  @IsString()
  from: string;

  @IsString()
  to: string;

  @IsNumber()
  @Min(0.01)
  amount: number;
}

export class DepositDto {
  @IsString()
  anchor: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  asset: string;

  @IsString()
  userId: string;
}

export class WithdrawDto {
  @IsString()
  anchor: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  asset: string;

  @IsString()
  userId: string;

  @IsString()
  destination: string;
}
