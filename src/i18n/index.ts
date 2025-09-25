import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation resources
import enTranslations from './locales/en/translation.json';
import esTranslations from './locales/es/translation.json';
import frTranslations from './locales/fr/translation.json';
import deTranslations from './locales/de/translation.json';
import jaTranslations from './locales/ja/translation.json';
import zhTranslations from './locales/zh/translation.json';
import arTranslations from './locales/ar/translation.json';
import ptTranslations from './locales/pt/translation.json';

// Supported languages configuration
export const supportedLanguages = {
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    regions: ['US', 'GB', 'CA', 'AU'],
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
    regions: ['ES', 'MX', 'AR', 'CO', 'CL'],
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
    regions: ['FR', 'CA', 'BE', 'CH'],
  },
  de: {
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false,
    regions: ['DE', 'AT', 'CH'],
  },
  ja: {
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    rtl: false,
    regions: ['JP'],
  },
  zh: {
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    rtl: false,
    regions: ['CN', 'TW', 'HK'],
  },
  ar: {
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true,
    regions: ['SA', 'AE', 'EG', 'MA', 'DZ'],
  },
  pt: {
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    rtl: false,
    regions: ['BR', 'PT'],
  },
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

// Language detection configuration
const languageDetectorOptions = {
  // Order of detection methods
  order: ['localStorage', 'sessionStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],

  // Keys to use for localStorage/sessionStorage
  lookupLocalStorage: 'vux-sort-language',
  lookupSessionStorage: 'vux-sort-language',

  // Cache user language on localStorage
  caches: ['localStorage'],

  // Only detect languages we support
  checkForSimilarInWhitelist: true,
};

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Language detection
    fallbackLng: 'en',
    supportedLngs: Object.keys(supportedLanguages),

    // Resources
    resources: {
      en: { translation: enTranslations },
      es: { translation: esTranslations },
      fr: { translation: frTranslations },
      de: { translation: deTranslations },
      ja: { translation: jaTranslations },
      zh: { translation: zhTranslations },
      ar: { translation: arTranslations },
      pt: { translation: ptTranslations },
    },

    // Detection options
    detection: languageDetectorOptions,

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already does escaping
      formatSeparator: ',',
    },

    // React options
    react: {
      useSuspense: false, // Disable suspense to avoid loading states
    },

    // Debugging (disable in production)
    debug: process.env.NODE_ENV === 'development',

    // Namespace configuration
    defaultNS: 'translation',
    ns: ['translation'],

    // Missing key handling
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng: readonly string[], _ns: string, key: string, _fallbackValue: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
      }
    },

    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',

    // Postprocessing
    postProcess: ['interval'],
  });

// Helper functions for language management
export const getLanguageInfo = (langCode: string) => {
  return supportedLanguages[langCode as SupportedLanguage] || supportedLanguages.en;
};

export const isRTLLanguage = (langCode: string): boolean => {
  return getLanguageInfo(langCode).rtl;
};

export const getSupportedLanguageCodes = (): string[] => {
  return Object.keys(supportedLanguages);
};

export const formatNumber = (number: number, locale?: string): string => {
  const currentLocale = locale || i18n.language;

  try {
    return new Intl.NumberFormat(currentLocale).format(number);
  } catch (error) {
    // Fallback to English formatting
    return new Intl.NumberFormat('en-US').format(number);
  }
};

export const formatDate = (date: Date | string | number, options?: Intl.DateTimeFormatOptions, locale?: string): string => {
  const currentLocale = locale || i18n.language;
  const dateObj = new Date(date);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const formatOptions = { ...defaultOptions, ...options };

  try {
    return new Intl.DateTimeFormat(currentLocale, formatOptions).format(dateObj);
  } catch (error) {
    // Fallback to English formatting
    return new Intl.DateTimeFormat('en-US', formatOptions).format(dateObj);
  }
};

export const formatRelativeTime = (date: Date | string | number, locale?: string): string => {
  const currentLocale = locale || i18n.language;
  const dateObj = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  try {
    const rtf = new Intl.RelativeTimeFormat(currentLocale, { numeric: 'auto' });

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 604800) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 2628000) {
      return rtf.format(-Math.floor(diffInSeconds / 604800), 'week');
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2628000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  } catch (error) {
    // Fallback to simple time formatting
    return formatDate(dateObj, undefined, locale);
  }
};

export const formatPercentage = (value: number, locale?: string): string => {
  const currentLocale = locale || i18n.language;

  try {
    return new Intl.NumberFormat(currentLocale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value / 100);
  } catch (error) {
    return `${value}%`;
  }
};

export const formatCurrency = (amount: number, currency: string = 'USD', locale?: string): string => {
  const currentLocale = locale || i18n.language;

  try {
    return new Intl.NumberFormat(currentLocale, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch (error) {
    return `${currency} ${amount}`;
  }
};

// Text direction utilities
export const getTextDirection = (langCode?: string): 'ltr' | 'rtl' => {
  const language = langCode || i18n.language;
  return isRTLLanguage(language) ? 'rtl' : 'ltr';
};

export const applyRTLStyles = (langCode?: string) => {
  const direction = getTextDirection(langCode);
  document.documentElement.dir = direction;
  document.documentElement.lang = langCode || i18n.language;
};

// Apply RTL styles on language change
i18n.on('languageChanged', (lng) => {
  applyRTLStyles(lng);
});

export default i18n;