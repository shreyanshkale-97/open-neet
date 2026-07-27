import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsInt, Min, Max } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128)
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  fullName!: string;

  @IsOptional()
  @IsInt()
  @Min(2025)
  @Max(2040)
  targetNeetYear?: number;
}

export class LoginDto {
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}