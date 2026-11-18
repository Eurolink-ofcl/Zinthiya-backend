import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateDonorDto {
  @ApiPropertyOptional({ example: 'Eleanor Vance' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '+44 7123 456789' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '12 New Walk' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Leicester' })
  @IsOptional()
  @IsString()
  townCity?: string;

  @ApiPropertyOptional({ example: 'LE1 6TF' })
  @IsOptional()
  @IsString()
  postcode?: string;

  @ApiPropertyOptional({ example: 'United Kingdom' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  generalConsent?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  emailNewsletter?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  smsAlerts?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  postalUpdates?: boolean;
}
