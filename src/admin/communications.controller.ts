import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TranslationService, TranslationResult } from './translation.service';

export class TranslateMessageDto {
  message: string;
  sourceLanguage?: string;
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
