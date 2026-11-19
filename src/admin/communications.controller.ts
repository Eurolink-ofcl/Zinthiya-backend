import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TranslationService, TranslationResult } from './translation.service';

export class TranslateMessageDto {
  @ApiProperty({ description: 'The text message to translate', example: 'എനിക്ക് സഹായം വേണം' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ description: 'Source language code or auto', example: 'auto', default: 'auto' })
  @IsString()
  @IsOptional()
  sourceLanguage?: string;

  @ApiPropertyOptional({ description: 'Target language code', example: 'en', default: 'en' })
  @IsString()
  @IsOptional()
  targetLanguage?: string;
}

@ApiTags('Communications & Translation')
@Controller()
export class CommunicationsController {
  constructor(private readonly translationService: TranslationService) {}

  @Post(['communications/translate', 'v1/communications/translate'])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dynamic neural machine translation between any supported language pair' })
  async translate(@Body() body: TranslateMessageDto): Promise<TranslationResult> {
    const message = body.message || '';
    const sourceLang = body.sourceLanguage || 'auto';
    const targetLang = body.targetLanguage || 'en';
    return this.translationService.translate(message, targetLang, sourceLang);
  }
}
