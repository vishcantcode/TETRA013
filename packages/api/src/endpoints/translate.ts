import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini-service';
import { sendSuccess, sendError } from '../response';

const DICTIONARY: Record<string, Record<string, string>> = {
  hi: {
    'Type 2 Diabetes Mellitus': 'टाइप 2 मधुमेह (शुगर)',
    'Essential Hypertension': 'उच्च रक्तचाप (हाई बीपी)',
    'Chronic Kidney Disease': 'क्रॉनिक किडनी रोग',
    'Cardiovascular Disease': 'हृदय रोग',
    'Stroke Risk': 'स्ट्रोक (लकवा) का जोखिम',
    'High Risk': 'उच्च जोखिम',
    'Moderate Risk': 'मध्यम जोखिम',
    'Low Risk': 'कम जोखिम',
  },
  gu: {
    'Type 2 Diabetes Mellitus': 'ટાઇપ 2 ડાયાબિટીસ (સુગર)',
    'Essential Hypertension': 'ઉચ્ચ રક્તચિંતન (હાઇ બીપી)',
    'Chronic Kidney Disease': 'ક્રોનિક કિડની રોગ',
    'Cardiovascular Disease': 'હૃદય રોગ',
    'Stroke Risk': 'સ્ટ્રોક (લકવો) જોખમ',
    'High Risk': 'ઉચ્ચ જોખમ',
    'Moderate Risk': 'મધ્યમ જોખમ',
    'Low Risk': 'ઓછું જોખમ',
  },
  ta: {
    'Type 2 Diabetes Mellitus': 'வகை 2 நீரிழிவு நோய்',
    'Essential Hypertension': 'உயர் இரத்த அழுத்தம்',
    'Chronic Kidney Disease': 'நாள்பட்ட சிறுநீரக நோய்',
    'Cardiovascular Disease': 'இதய நோய்',
    'Stroke Risk': 'பக்கவாதம் அபாயம்',
    'High Risk': 'அதிக ஆபத்து',
    'Moderate Risk': 'மிதமான ஆபத்து',
    'Low Risk': 'குறைந்த ஆபத்து',
  }
};

export async function handleTranslate(req: Request, res: Response) {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return sendError(res, 400, 'INVALID_INPUT', 'Text and targetLanguage (en, hi, gu, ta) are required.');
    }

    if (targetLanguage === 'en') {
      return sendSuccess(res, { translatedText: text, targetLanguage });
    }

    const langDict = DICTIONARY[targetLanguage];
    if (langDict && langDict[text]) {
      return sendSuccess(res, { translatedText: langDict[text], targetLanguage, source: 'dictionary' });
    }

    const translated = await GeminiService.generate(
      `Translate the following clinical text into ${targetLanguage} (Hindi/Gujarati/Tamil). Keep medical terms accurate:\n"${text}"`
    );

    const finalText = translated ? translated.trim() : text;

    return sendSuccess(res, {
      translatedText: finalText,
      targetLanguage,
      source: translated ? 'gemini' : 'fallback'
    });
  } catch (error: any) {
    console.error('[handleTranslate Error]', error);
    return sendError(res, 500, 'TRANSLATION_FAILED', error.message || 'Error processing translation.');
  }
}
