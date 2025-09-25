import React, { useState } from 'react';
import { Sun, Moon, Monitor, Palette, Check, Settings } from 'lucide-react';
import { useThemeContext, ThemeMode, ThemeVariant } from '../hooks/useTheme';

interface ThemeSelectorProps {
  compact?: boolean;
  showVariants?: boolean;
  className?: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  compact = false,
  showVariants = true,
  className = ''
}) => {
  const {
    mode,
    variant,
    setMode,
    setVariant,
    toggleMode,
    resetToSystem,
    effectiveMode,
    systemPreference
  } = useThemeContext();

  const [isOpen, setIsOpen] = useState(false);

  const modeOptions: Array<{
    value: ThemeMode;
    label: string;
    icon: React.ReactNode;
    description: string;
  }> = [
    {
      value: 'light',
      label: 'Light Mode',
      icon: <Sun className="w-4 h-4" />,
      description: 'Always use light theme'
    },
    {
      value: 'dark',
      label: 'Dark Mode',
      icon: <Moon className="w-4 h-4" />,
      description: 'Always use dark theme'
    },
    {
      value: 'auto',
      label: 'System',
      icon: <Monitor className="w-4 h-4" />,
      description: `Follow system preference (currently ${systemPreference})`
    }
  ];

  const variantOptions: Array<{
    value: ThemeVariant;
    label: string;
    description: string;
    colorPreview: string;
  }> = [
    {
      value: 'default',
      label: 'Default',
      description: 'Standard blue theme',
      colorPreview: '#3b82f6'
    },
    {
      value: 'high-contrast',
      label: 'High Contrast',
      description: 'Improved accessibility',
      colorPreview: '#000000'
    },
    {
      value: 'warm',
      label: 'Warm',
      description: 'Red and orange accents',
      colorPreview: '#dc2626'
    },
    {
      value: 'cool',
      label: 'Cool',
      description: 'Cyan and teal accents',
      colorPreview: '#0891b2'
    },
    {
      value: 'accessible',
      label: 'Accessible',
      description: 'Optimized for screen readers',
      colorPreview: '#6366f1'
    }
  ];

  const currentModeOption = modeOptions.find(option => option.value === mode);

  if (compact) {
    return (
      <button
        onClick={toggleMode}
        className={`
          p-2 rounded-lg transition-colors duration-200
          bg-[var(--color-bg-secondary)] hover:bg-[var(--color-hover-bg)]
          border border-[var(--color-border-primary)]
          text-[var(--color-text-primary)]
          focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]
          min-w-touch min-h-touch
          ${className}
        `}
        title={`Current: ${currentModeOption?.label} - Click to toggle`}
        aria-label={`Theme: ${currentModeOption?.label}. Click to cycle through themes.`}
      >
        {currentModeOption?.icon}
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200
          bg-[var(--color-bg-card)] hover:bg-[var(--color-hover-bg)]
          border border-[var(--color-border-primary)]
          text-[var(--color-text-primary)]
          focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]
          min-h-touch
        `}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Theme settings"
      >
        <Settings className="w-4 h-4" />
        <span className="text-sm font-medium">Theme</span>
        <div className="flex items-center space-x-1 text-xs text-[var(--color-text-secondary)]">
          {currentModeOption?.icon}
          <span>{currentModeOption?.label}</span>
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className={`
            absolute right-0 top-full mt-2 w-80 z-50
            bg-[var(--color-bg-card)] border border-[var(--color-border-primary)]
            rounded-xl shadow-[var(--shadow-xl)] p-4
            animate-mobile-slide-up
          `}>
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-[var(--color-text-primary)] flex items-center">
                  <Palette className="w-4 h-4 mr-2" />
                  Theme Settings
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-[var(--color-hover-bg)] text-[var(--color-text-secondary)]"
                  aria-label="Close theme settings"
                >
                  ✕
                </button>
              </div>

              {/* Current Status */}
              <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)]">
                <div className="text-xs text-[var(--color-text-secondary)] mb-1">Current Theme</div>
                <div className="flex items-center space-x-2 text-sm">
                  {currentModeOption?.icon}
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {currentModeOption?.label}
                  </span>
                  {variant !== 'default' && (
                    <>
                      <span className="text-[var(--color-text-secondary)]">•</span>
                      <span className="text-[var(--color-text-secondary)]">
                        {variantOptions.find(v => v.value === variant)?.label}
                      </span>
                    </>
                  )}
                </div>
                <div className="text-xs text-[var(--color-text-tertiary)] mt-1">
                  Effective: {effectiveMode === 'dark' ? 'Dark' : 'Light'}
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Color Mode
                </h4>
                <div className="space-y-1">
                  {modeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setMode(option.value);
                        if (!showVariants) setIsOpen(false);
                      }}
                      className={`
                        w-full flex items-center space-x-3 p-3 rounded-lg transition-colors
                        hover:bg-[var(--color-hover-bg)]
                        focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]
                        ${mode === option.value ? 'bg-[var(--color-selected-bg)] border border-[var(--color-accent-primary)]' : 'border border-transparent'}
                      `}
                      aria-pressed={mode === option.value}
                    >
                      <div className="flex-shrink-0 text-[var(--color-text-primary)]">
                        {option.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-[var(--color-text-primary)]">
                          {option.label}
                        </div>
                        <div className="text-xs text-[var(--color-text-secondary)]">
                          {option.description}
                        </div>
                      </div>
                      {mode === option.value && (
                        <Check className="w-4 h-4 text-[var(--color-accent-primary)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Variant Selection */}
              {showVariants && (
                <div>
                  <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Color Scheme
                  </h4>
                  <div className="space-y-1">
                    {variantOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setVariant(option.value)}
                        className={`
                          w-full flex items-center space-x-3 p-3 rounded-lg transition-colors
                          hover:bg-[var(--color-hover-bg)]
                          focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]
                          ${variant === option.value ? 'bg-[var(--color-selected-bg)] border border-[var(--color-accent-primary)]' : 'border border-transparent'}
                        `}
                        aria-pressed={variant === option.value}
                      >
                        <div
                          className="flex-shrink-0 w-4 h-4 rounded-full border border-[var(--color-border-secondary)]"
                          style={{ backgroundColor: option.colorPreview }}
                        />
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-[var(--color-text-primary)]">
                            {option.label}
                          </div>
                          <div className="text-xs text-[var(--color-text-secondary)]">
                            {option.description}
                          </div>
                        </div>
                        {variant === option.value && (
                          <Check className="w-4 h-4 text-[var(--color-accent-primary)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-2 border-t border-[var(--color-border-primary)]">
                <button
                  onClick={() => {
                    resetToSystem();
                    setIsOpen(false);
                  }}
                  className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] underline"
                >
                  Reset to system default
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`
                    px-3 py-1.5 rounded-md text-sm font-medium
                    bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)]
                    hover:bg-[var(--color-accent-hover)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]
                  `}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSelector;