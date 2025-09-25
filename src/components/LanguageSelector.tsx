import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { supportedLanguages, SupportedLanguage, getTextDirection, applyRTLStyles } from '../i18n';

interface LanguageSelectorProps {
  compact?: boolean;
  showNativeNames?: boolean;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = false,
  showNativeNames = true,
  className = ''
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = i18n.language as SupportedLanguage;
  const currentLanguageInfo = supportedLanguages[currentLanguage] || supportedLanguages.en;

  const handleLanguageChange = async (langCode: SupportedLanguage) => {
    try {
      await i18n.changeLanguage(langCode);
      applyRTLStyles(langCode);
      setIsOpen(false);

      // Announce language change for screen readers
      const announcement = t('settings.language.interface_language') + ': ' + supportedLanguages[langCode].name;
      // Create temporary announcement element
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.textContent = announcement;
      document.body.appendChild(announcer);

      setTimeout(() => {
        document.body.removeChild(announcer);
      }, 1000);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const getLanguageDisplayName = (info: typeof currentLanguageInfo) => {
    if (showNativeNames) {
      return info.nativeName;
    }
    return info.name;
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
            bg-[var(--color-bg-secondary)] hover:bg-[var(--color-hover-bg)]
            border border-[var(--color-border-primary)]
            text-[var(--color-text-primary)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]
            min-h-touch
          `}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={t('settings.language.interface_language')}
          title={`Current language: ${currentLanguageInfo.name}`}
        >
          <span className="text-lg" aria-hidden="true">
            {currentLanguageInfo.flag}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div
              className={`
                absolute top-full mt-1 w-64 z-50
                bg-[var(--color-bg-card)] border border-[var(--color-border-primary)]
                rounded-lg shadow-[var(--shadow-lg)] py-2 max-h-80 overflow-y-auto
                ${getTextDirection() === 'rtl' ? 'left-0' : 'right-0'}
              `}
              role="listbox"
              aria-label={t('settings.language.interface_language')}
            >
              {Object.entries(supportedLanguages).map(([langCode, langInfo]) => (
                <button
                  key={langCode}
                  onClick={() => handleLanguageChange(langCode as SupportedLanguage)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-2 text-left
                    hover:bg-[var(--color-hover-bg)]
                    focus:outline-none focus:bg-[var(--color-hover-bg)]
                    ${currentLanguage === langCode ? 'bg-[var(--color-selected-bg)]' : ''}
                    min-h-touch
                  `}
                  role="option"
                  aria-selected={currentLanguage === langCode}
                  dir={langInfo.rtl ? 'rtl' : 'ltr'}
                >
                  <span className="text-lg flex-shrink-0" aria-hidden="true">
                    {langInfo.flag}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[var(--color-text-primary)]">
                      {getLanguageDisplayName(langInfo)}
                    </div>
                    {showNativeNames && langInfo.nativeName !== langInfo.name && (
                      <div className="text-sm text-[var(--color-text-secondary)]">
                        {langInfo.name}
                      </div>
                    )}
                  </div>
                  {currentLanguage === langCode && (
                    <Check className="w-4 h-4 text-[var(--color-accent-primary)] flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--color-text-primary)]">
            <Globe className="w-4 h-4 inline mr-2" />
            {t('settings.language.interface_language')}
          </label>
          <div className="flex items-center space-x-2 text-sm text-[var(--color-text-secondary)]">
            <span className="text-base" aria-hidden="true">
              {currentLanguageInfo.flag}
            </span>
            <span>{currentLanguageInfo.name}</span>
            {currentLanguageInfo.rtl && (
              <span className="px-2 py-1 bg-[var(--color-bg-secondary)] rounded text-xs">
                RTL
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(supportedLanguages).map(([langCode, langInfo]) => (
            <button
              key={langCode}
              onClick={() => handleLanguageChange(langCode as SupportedLanguage)}
              className={`
                flex items-center space-x-3 p-3 rounded-lg border transition-all
                hover:bg-[var(--color-hover-bg)]
                focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]
                ${currentLanguage === langCode
                  ? 'border-[var(--color-accent-primary)] bg-[var(--color-selected-bg)]'
                  : 'border-[var(--color-border-primary)]'
                }
                min-h-touch
              `}
              role="option"
              aria-selected={currentLanguage === langCode}
              dir={langInfo.rtl ? 'rtl' : 'ltr'}
            >
              <span className="text-xl flex-shrink-0" aria-hidden="true">
                {langInfo.flag}
              </span>
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium text-[var(--color-text-primary)]">
                  {getLanguageDisplayName(langInfo)}
                </div>
                <div className="text-sm text-[var(--color-text-secondary)] flex items-center space-x-2">
                  <span>{langInfo.name}</span>
                  {langInfo.rtl && (
                    <span className="px-1.5 py-0.5 bg-[var(--color-bg-tertiary)] rounded text-xs font-medium">
                      RTL
                    </span>
                  )}
                </div>
              </div>
              {currentLanguage === langCode && (
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-[var(--color-accent-primary)] flex items-center justify-center">
                    <Check className="w-3 h-3 text-[var(--color-text-inverse)]" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 p-3 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border-primary)]">
          <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
            {t('settings.language.auto_detect')}
          </h4>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Language preference is automatically detected from your browser settings and saved locally.
            You can change it anytime from this menu.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;