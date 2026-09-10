import { IsString, IsOptional, IsIn, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateMerchantDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^G[A-Z0-9]{55}$/)
  walletAddress: string;
}

export class UpdateKycDto {
  @IsString()
  @IsIn(['PENDING', 'VERIFIED', 'REJECTED'])
  status: string;
}
