import { Injectable, Logger } from '@nestjs/common';
import * as https from 'https';

export interface TranslationResult {
  originalMessage: string;
  detectedLanguage: string;
  targetLanguage: string;
  translatedMessage: string;
}

const LANGUAGE_NAME_MAP: Record<string, string> = {
  ml: 'Malayalam (മലയാളം)',
  hi: 'Hindi (हिन्दी)',
  ta: 'Tamil (தமிழ்)',
  ar: 'Arabic (العربية)',
  gu: 'Gujarati (ગુજરાતી)',
  ur: 'Urdu (اردو)',
  bn: 'Bengali (বাংলা)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
  so: 'Somali (Soomaali)',
  pl: 'Polish (Polski)',
  fr: 'French (Français)',
  es: 'Spanish (Español)',
  en: 'English (UK)',
};

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly cache = new Map<string, { translated: string; detected: string }>();

  /**
   * Translates a message between source and target languages dynamically.
   * Supports auto-detection when sourceLanguage is 'auto' or omitted.
   */
  async translate(
    message: string,
    targetLanguage: string = 'en',
    sourceLanguage: string = 'auto',
  ): Promise<TranslationResult> {
    const trimmed = (message || '').trim();
    if (!trimmed) {
      return {
        originalMessage: message,
        detectedLanguage: sourceLanguage === 'auto' ? 'en' : sourceLanguage,
        targetLanguage,
        translatedMessage: message,
      };
    }

    const sl = (sourceLanguage || 'auto').toLowerCase();
    const tl = (targetLanguage || 'en').toLowerCase();

    // If source and target are identical and specified, skip translation
    if (sl !== 'auto' && sl === tl) {
      return {
        originalMessage: trimmed,
        detectedLanguage: sl,
        targetLanguage: tl,
        translatedMessage: trimmed,
      };
    }

    // Check in-memory cache to avoid redundant external network calls
    const cacheKey = `${sl}|${tl}|${trimmed}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return {
        originalMessage: trimmed,
        detectedLanguage: cached.detected,
        targetLanguage: tl,
        translatedMessage: cached.translated,
      };
    }

    try {
      const result = await this.fetchTranslation(trimmed, tl, sl);
      // Cache result (capped at 5000 items to avoid memory buildup)
      if (this.cache.size > 5000) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey) this.cache.delete(firstKey);
      }
      this.cache.set(cacheKey, {
        translated: result.translatedMessage,
        detected: result.detectedLanguage,
      });
      return result;
    } catch (err: any) {
      this.logger.warn(`Translation error: ${err.message}. Returning original.`);
      return {
        originalMessage: trimmed,
        detectedLanguage: sl === 'auto' ? 'en' : sl,
        targetLanguage: tl,
        translatedMessage: trimmed,
      };
    }
  }

  private fetchTranslation(
    text: string,
    targetLang: string,
    sourceLang: string,
  ): Promise<TranslationResult> {
    return new Promise((resolve, reject) => {
      const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${encodeURIComponent(
        sourceLang,
      )}&tl=${encodeURIComponent(targetLang)}&q=${encodeURIComponent(text)}`;

      const req = https.get(
        url,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          timeout: 6000,
        },
        (res) => {
          let rawData = '';
          res.on('data', (chunk) => (rawData += chunk));
          res.on('end', () => {
            try {
              const parsed = JSON.parse(rawData);
              let translatedText = text;
              let detectedCode = sourceLang === 'auto' ? 'en' : sourceLang;

              if (Array.isArray(parsed) && parsed.length > 0) {
                const first = parsed[0];
                if (Array.isArray(first)) {
                  // e.g. [["I need help", "ml"]]
                  translatedText = first[0] || text;
                  detectedCode = first[1] || detectedCode;
                } else if (typeof first === 'string') {
                  // e.g. ["നിങ്ങളുടെ സഹായ അഭ്യർത്ഥന അംഗീകരിച്ചു."]
                  translatedText = first;
                }
              }

              resolve({
                originalMessage: text,
                detectedLanguage: detectedCode,
                targetLanguage: targetLang,
                translatedMessage: translatedText,
              });
            } catch (parseErr) {
              reject(parseErr);
            }
          });
        },
      );

      req.on('timeout', () => {
        req.destroy(new Error('Translation request timed out'));
      });
      req.on('error', reject);
    });
  }

  /**
   * Maps a 2-letter language code to human-readable label with native script
   */
  getLanguageLabel(code: string): string {
    const clean = (code || '').toLowerCase().trim();
    return LANGUAGE_NAME_MAP[clean] || clean.toUpperCase();
  }
}
