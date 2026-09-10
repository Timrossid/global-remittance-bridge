import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  walletAddress: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  network?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  likedMost: string;

  @IsString()
  missingFeature: string;

  @IsString()
  issues: string;

  @IsString()
  recommend: string;

  @IsString()
  improvements: string;
}
