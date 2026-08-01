import { SupportedLanguage } from '../interfaces/LanguageProfile';

export const LOCALIZATION_DICTIONARY: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    HEALTH_SUMMARY_TITLE: 'Personalized Health Care Plan',
    DAILY_GOALS_LABEL: 'Daily Goals',
    WEEKLY_GOALS_LABEL: 'Weekly Goals',
    RED_FLAGS_LABEL: 'Warning Symptoms requiring Immediate Care',
    DIET_LABEL: 'Dietary Guidelines',
    EXERCISE_LABEL: 'Physical Activity & Exercise',
    EMERGENCY_CONTACT: 'In case of chest pain, shortness of breath, or confusion, call 108 or visit nearest hospital immediately.'
  },
  hi: {
    HEALTH_SUMMARY_TITLE: 'व्यक्तिगत स्वास्थ्य देखभाल योजना',
    DAILY_GOALS_LABEL: 'दैनिक लक्ष्य',
    WEEKLY_GOALS_LABEL: 'साप्ताहिक लक्ष्य',
    RED_FLAGS_LABEL: 'आवश्यक चेतावनी लक्षण (तुरंत डॉक्टर से मिलें)',
    DIET_LABEL: 'आहार संबंधी दिशा-निर्देश',
    EXERCISE_LABEL: 'शारीरिक गतिविधि और व्यायाम',
    EMERGENCY_CONTACT: 'सीने में दर्द, सांस फूलने या अत्यधिक चक्कर आने पर तुरंत 108 पर कॉल करें या नजदीकी अस्पताल जाएं।'
  },
  gu: {
    HEALTH_SUMMARY_TITLE: 'વ્યક્તિગત આરોગ્ય સંભાળ યોજના',
    DAILY_GOALS_LABEL: 'દૈનિક લક્ષ્યો',
    WEEKLY_GOALS_LABEL: 'સાપ્તાહિક લક્ષ્યો',
    RED_FLAGS_LABEL: 'ગંભીર લક્ષણો (તાત્કાલિક ડૉક્ટરની સલાહ લો)',
    DIET_LABEL: 'આહાર સંબંધી સૂચનાઓ',
    EXERCISE_LABEL: 'શારીરિક પ્રવૃત્તિ અને કસરત',
    EMERGENCY_CONTACT: 'છાતીમાં દુખાવો, શ્વાસ ચડવો અથવા અતિશય અસ્વસ્થતા થાય તો તાત્કાલિક ૧૦૮ પર કોલ કરો અથવા હોસ્પિટલ પહોંચો.'
  }
};
