import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsInt()
  @Min(2025)
  @Max(2040)
  targetNeetYear?: number;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}