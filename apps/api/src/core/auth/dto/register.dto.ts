import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsInt } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(100)
  password!: string;

  @IsString()
  @MinLength(2, { message: 'Full name is required' })
  @MaxLength(100)
  fullName!: string;

  @IsOptional()
  @IsInt()
  targetYear?: number;
}