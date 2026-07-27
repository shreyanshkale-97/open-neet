import { IsEnum, IsBoolean, IsOptional, IsString } from 'class-validator';
import { Role } from '@neet-ai/shared/types';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role!: Role;
}

export class SuspendUserDto {
  @IsBoolean()
  isSuspended!: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateFeatureFlagDto {
  @IsBoolean()
  enabled!: boolean;
}