import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DonationType } from '@prisma/client';

export class CreateDonationDto {
  @ApiProperty({ example: 25.00, description: 'Donation amount in GBP' })
  @IsNotEmpty({ message: 'Amount is required' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Amount must be a valid number' })
  @Min(1, { message: 'Donation amount must be at least £1.00' })
  amount: number;

  @ApiPropertyOptional({ enum: DonationType, default: DonationType.ONE_OFF })
  @IsOptional()
  @IsEnum(DonationType)
  type?: DonationType;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  giftAid?: boolean;

  @ApiPropertyOptional({ example: 'campaign-uuid-here' })
  @IsOptional()
  @IsString()
  campaignId?: string;

  @ApiPropertyOptional({ example: 'Credit/Debit Card' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'MONTHLY' })
  @IsOptional()
  @IsString()
  frequency?: string;

  @ApiPropertyOptional({ example: 'TXN-12345678' })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  donorName?: string;

  @ApiPropertyOptional({ example: 'jane@example.com' })
  @IsOptional()
  @IsString()
  donorEmail?: string;

  @ApiPropertyOptional({ example: 'Emergency shelter support' })
  @IsOptional()
  @IsString()
  notes?: string;
}
