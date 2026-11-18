import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({ example: 'Eleanor Vance', description: 'Full name of the donor' })
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString({ message: 'Full name must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  fullName: string;

  @ApiProperty({ example: 'eleanor.vance@example.com', description: 'Valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  email: string;

  @ApiProperty({ example: '0116 254 5168', description: 'Phone number for contact/alerts' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  phoneNumber: string;

  @ApiProperty({ example: 'SecretP@ssw0rd', description: 'Password (min 8 characters)' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiPropertyOptional({ example: '12 New Walk, Leicester, LE1 6TF', description: 'Optional physical address' })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  address?: string;

  @ApiPropertyOptional({ example: true, description: 'Consent to communications and newsletters under UK GDPR' })
  @IsOptional()
  @IsBoolean({ message: 'Communication consent must be a boolean' })
  generalConsent?: boolean;
}
