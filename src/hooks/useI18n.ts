import { useTranslation, UseTranslationOptions } from 'react-i18next';
import { useMemo, useCallback } from 'react';
import {
  supportedLanguages,
  SupportedLanguage,
  getTextDirection,
  isRTLLanguage,
  formatNumber,
  formatDate,
  formatRelativeTime,
  formatPercentage,
  formatCurrency
} from '../i18n';

interface UseI18nOptions extends UseTranslationOptions<any> {
  // Additional options for enhanced i18n functionality
}

export const useI18n = (ns?: string | string[], options?: UseI18nOptions) => {
  const { t, i18n, ready } = useTranslation(ns, options);

  const currentLanguage = i18n.language as SupportedLanguage;
  const currentLanguageInfo = supportedLanguages[currentLanguage] || supportedLanguages.en;

  // Enhanced translation function with pluralization and context
  const translate = useCallback((
    key: string,
    options?: {
      count?: number;
      context?: string;
      defaultValue?: string;
      interpolation?: Record<string, any>;
    }
  ): string => {
    const translationOptions: any = {};

    if (options?.count !== undefined) {
      translationOptions.count = options.count;
    }

    if (options?.context) {
      translationOptions.context = options.context;
    }

    if (options?.defaultValue) {
      translationOptions.defaultValue = options.defaultValue;
    }

    if (options?.interpolation) {
      Object.assign(translationOptions, options.interpolation);
    }

    return t(key, translationOptions) as string;
  }, [t]);

  // Pluralization helper
  const plural = useCallback((
    key: string,
    count: number,
    interpolation?: Record<string, any>
  ): string => {
    return translate(key, { count, interpolation });
  }, [translate]);

  // Contextual translation
  const contextual = useCallback((
    key: string,
    context: string,
    interpolation?: Record<string, any>
  ): string => {
    return translate(key, { context, interpolation });
  }, [translate]);

  // Date and time formatting with current locale
  const formatters = useMemo(() => ({
    number: (value: number) => formatNumber(value, currentLanguage),
    date: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      formatDate(date, options, currentLanguage),
    relativeTime: (date: Date | string | number) =>
      formatRelativeTime(date, currentLanguage),
    percentage: (value: number) =>
      formatPercentage(value, currentLanguage),
    currency: (amount: number, currency?: string) =>
      formatCurrency(amount, currency, currentLanguage),
  }), [currentLanguage]);

  // Language utilities
  const languageUtils = useMemo(() => ({
    isRTL: isRTLLanguage(currentLanguage),
    direction: getTextDirection(currentLanguage),
    code: currentLanguage,
    name: currentLanguageInfo.name,
    nativeName: currentLanguageInfo.nativeName,
    flag: currentLanguageInfo.flag,
    regions: currentLanguageInfo.regions,
  }), [currentLanguage, currentLanguageInfo]);

  // Change language with error handling
  const changeLanguage = useCallback(async (langCode: SupportedLanguage) => {
    try {
      await i18n.changeLanguage(langCode);
      return true;
    } catch (error) {
      console.error('Failed to change language:', error);
      return false;
    }
  }, [i18n]);

  // Get available languages
  const availableLanguages = useMemo(() => {
    return Object.entries(supportedLanguages).map(([code, info]) => ({
      code: code as SupportedLanguage,
      ...info,
    }));
  }, []);

  // Check if a translation key exists
  const keyExists = useCallback((key: string, ns?: string): boolean => {
    return i18n.exists(key, { ns });
  }, [i18n]);

  // Get raw translation without interpolation
  const getRawTranslation = useCallback((key: string): string => {
    return t(key, { interpolation: { escapeValue: false } });
  }, [t]);

  // Time-related translations
  const timeTranslations = useMemo(() => ({
    justNow: () => t('time.just_now'),
    secondsAgo: (count: number) => plural('time.seconds_ago', count, { count }),
    minutesAgo: (count: number) => plural('time.minutes_ago', count, { count }),
    hoursAgo: (count: number) => plural('time.hours_ago', count, { count }),
    daysAgo: (count: number) => plural('time.days_ago', count, { count }),
    weeksAgo: (count: number) => plural('time.weeks_ago', count, { count }),
    monthsAgo: (count: number) => plural('time.months_ago', count, { count }),
    yearsAgo: (count: number) => plural('time.years_ago', count, { count }),
  }), [t, plural]);

  // Common UI translations
  const ui = useMemo(() => ({
    loading: () => t('common.loading'),
    error: () => t('common.error'),
    success: () => t('common.success'),
    warning: () => t('common.warning'),
    info: () => t('common.info'),
    save: () => t('common.save'),
    cancel: () => t('common.cancel'),
    delete: () => t('common.delete'),
    edit: () => t('common.edit'),
    add: () => t('common.add'),
    remove: () => t('common.remove'),
    back: () => t('common.back'),
    next: () => t('common.next'),
    previous: () => t('common.previous'),
    finish: () => t('common.finish'),
    continue: () => t('common.continue'),
    close: () => t('common.close'),
    help: () => t('common.help'),
    settings: () => t('common.settings'),
  }), [t]);

  // Accessibility-related translations
  const a11y = useMemo(() => ({
    skipToContent: () => t('accessibility.skip_to_content'),
    screenReaderOnly: () => t('accessibility.screen_reader_only'),
    closeDialog: () => t('accessibility.close_dialog'),
    openMenu: () => t('accessibility.open_menu'),
    closeMenu: () => t('accessibility.close_menu'),
    loading: () => t('accessibility.loading_content'),
    noResults: () => t('accessibility.no_results'),
  }), [t]);

  // Validation message helpers
  const validation = useMemo(() => ({
    required: (field: string) => t('validation.field_required', { field }),
    minLength: (field: string, min: number) =>
      t('validation.min_length', { field, min }),
    maxLength: (field: string, max: number) =>
      t('validation.max_length', { field, max }),
    email: () => t('validation.invalid_email'),
    url: () => t('validation.invalid_url'),
    number: () => t('validation.invalid_number'),
  }), [t]);

  return {
    // Core translation functions
    t,
    translate,
    plural,
    contextual,

    // Language information
    language: languageUtils,
    changeLanguage,
    availableLanguages,

    // Formatting utilities
    format: formatters,

    // Utility functions
    keyExists,
    getRawTranslation,

    // Predefined translation groups
    time: timeTranslations,
    ui,
    a11y,
    validation,

    // React i18next values
    i18n,
    ready,
  };
};

export default useI18n;