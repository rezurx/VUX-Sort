import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ThemeVariant = 'default' | 'high-contrast' | 'warm' | 'cool' | 'accessible';

interface ThemeColors {
  // Background colors
  'bg-primary': string;
  'bg-secondary': string;
  'bg-tertiary': string;
  'bg-overlay': string;
  'bg-card': string;
  'bg-sidebar': string;

  // Text colors
  'text-primary': string;
  'text-secondary': string;
  'text-tertiary': string;
  'text-inverse': string;
  'text-muted': string;

  // Border colors
  'border-primary': string;
  'border-secondary': string;
  'border-focus': string;
  'border-error': string;
  'border-success': string;

  // Accent colors
  'accent-primary': string;
  'accent-secondary': string;
  'accent-hover': string;
  'accent-active': string;
  'accent-disabled': string;

  // Status colors
  'status-success': string;
  'status-warning': string;
  'status-error': string;
  'status-info': string;

  // Interactive states
  'hover-bg': string;
  'active-bg': string;
  'focus-ring': string;
  'selected-bg': string;

  // Card sorting specific
  'card-bg': string;
  'card-border': string;
  'card-hover': string;
  'card-selected': string;
  'card-dragging': string;
  'category-bg': string;
  'category-border': string;
  'category-hover': string;
}

interface ThemeConfig {
  mode: ThemeMode;
  variant: ThemeVariant;
  colors: ThemeColors;
  shadows: Record<string, string>;
  transitions: Record<string, string>;
  fontFamily: string;
  borderRadius: Record<string, string>;
  spacing: Record<string, string>;
}

// Theme definitions
const lightTheme: ThemeColors = {
  'bg-primary': '#ffffff',
  'bg-secondary': '#f9fafb',
  'bg-tertiary': '#f3f4f6',
  'bg-overlay': 'rgba(0, 0, 0, 0.5)',
  'bg-card': '#ffffff',
  'bg-sidebar': '#f8fafc',

  'text-primary': '#111827',
  'text-secondary': '#374151',
  'text-tertiary': '#6b7280',
  'text-inverse': '#ffffff',
  'text-muted': '#9ca3af',

  'border-primary': '#e5e7eb',
  'border-secondary': '#d1d5db',
  'border-focus': '#3b82f6',
  'border-error': '#ef4444',
  'border-success': '#10b981',

  'accent-primary': '#3b82f6',
  'accent-secondary': '#6366f1',
  'accent-hover': '#2563eb',
  'accent-active': '#1d4ed8',
  'accent-disabled': '#9ca3af',

  'status-success': '#10b981',
  'status-warning': '#f59e0b',
  'status-error': '#ef4444',
  'status-info': '#3b82f6',

  'hover-bg': '#f9fafb',
  'active-bg': '#f3f4f6',
  'focus-ring': 'rgba(59, 130, 246, 0.2)',
  'selected-bg': '#eff6ff',

  'card-bg': '#ffffff',
  'card-border': '#e5e7eb',
  'card-hover': '#f9fafb',
  'card-selected': '#eff6ff',
  'card-dragging': '#f0f9ff',
  'category-bg': '#f9fafb',
  'category-border': '#d1d5db',
  'category-hover': '#ecfdf5',
};

const darkTheme: ThemeColors = {
  'bg-primary': '#0f172a',
  'bg-secondary': '#1e293b',
  'bg-tertiary': '#334155',
  'bg-overlay': 'rgba(0, 0, 0, 0.75)',
  'bg-card': '#1e293b',
  'bg-sidebar': '#0f172a',

  'text-primary': '#f8fafc',
  'text-secondary': '#cbd5e1',
  'text-tertiary': '#94a3b8',
  'text-inverse': '#0f172a',
  'text-muted': '#64748b',

  'border-primary': '#334155',
  'border-secondary': '#475569',
  'border-focus': '#60a5fa',
  'border-error': '#f87171',
  'border-success': '#34d399',

  'accent-primary': '#60a5fa',
  'accent-secondary': '#818cf8',
  'accent-hover': '#3b82f6',
  'accent-active': '#2563eb',
  'accent-disabled': '#64748b',

  'status-success': '#34d399',
  'status-warning': '#fbbf24',
  'status-error': '#f87171',
  'status-info': '#60a5fa',

  'hover-bg': '#334155',
  'active-bg': '#475569',
  'focus-ring': 'rgba(96, 165, 250, 0.2)',
  'selected-bg': '#1e40af',

  'card-bg': '#1e293b',
  'card-border': '#334155',
  'card-hover': '#334155',
  'card-selected': '#1e40af',
  'card-dragging': '#1e3a8a',
  'category-bg': '#1e293b',
  'category-border': '#475569',
  'category-hover': '#065f46',
};

const highContrastTheme: ThemeColors = {
  'bg-primary': '#ffffff',
  'bg-secondary': '#f5f5f5',
  'bg-tertiary': '#e0e0e0',
  'bg-overlay': 'rgba(0, 0, 0, 0.8)',
  'bg-card': '#ffffff',
  'bg-sidebar': '#f8f8f8',

  'text-primary': '#000000',
  'text-secondary': '#000000',
  'text-tertiary': '#333333',
  'text-inverse': '#ffffff',
  'text-muted': '#666666',

  'border-primary': '#000000',
  'border-secondary': '#333333',
  'border-focus': '#0000ff',
  'border-error': '#ff0000',
  'border-success': '#008000',

  'accent-primary': '#0000ff',
  'accent-secondary': '#800080',
  'accent-hover': '#0000cc',
  'accent-active': '#000099',
  'accent-disabled': '#999999',

  'status-success': '#008000',
  'status-warning': '#ff8000',
  'status-error': '#ff0000',
  'status-info': '#0000ff',

  'hover-bg': '#e0e0e0',
  'active-bg': '#cccccc',
  'focus-ring': 'rgba(0, 0, 255, 0.3)',
  'selected-bg': '#ffff00',

  'card-bg': '#ffffff',
  'card-border': '#000000',
  'card-hover': '#f0f0f0',
  'card-selected': '#ffff00',
  'card-dragging': '#e0e0ff',
  'category-bg': '#f8f8f8',
  'category-border': '#000000',
  'category-hover': '#e0ffe0',
};

const warmTheme: ThemeColors = {
  ...lightTheme,
  'accent-primary': '#dc2626',
  'accent-secondary': '#ea580c',
  'accent-hover': '#b91c1c',
  'accent-active': '#991b1b',
  'status-info': '#dc2626',
  'focus-ring': 'rgba(220, 38, 38, 0.2)',
  'card-selected': '#fef2f2',
  'selected-bg': '#fef2f2',
};

const coolTheme: ThemeColors = {
  ...lightTheme,
  'accent-primary': '#0891b2',
  'accent-secondary': '#0e7490',
  'accent-hover': '#0e7490',
  'accent-active': '#155e75',
  'status-info': '#0891b2',
  'focus-ring': 'rgba(8, 145, 178, 0.2)',
  'card-selected': '#ecfeff',
  'selected-bg': '#ecfeff',
};

interface ThemeContextType {
  theme: ThemeConfig;
  mode: ThemeMode;
  variant: ThemeVariant;
  effectiveMode: 'light' | 'dark';
  systemPreference: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  setVariant: (variant: ThemeVariant) => void;
  toggleMode: () => void;
  resetToSystem: () => void;
  applyTheme: () => void;
  getThemeVariable: (key: keyof ThemeColors) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'vux-sort-theme';

export const useTheme = () => {
  const [mode, setMode] = useState<ThemeMode>('auto');
  const [variant, setVariant] = useState<ThemeVariant>('default');
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>('light');

  // Detect system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load saved preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        const { mode: savedMode, variant: savedVariant } = JSON.parse(saved);
        if (savedMode) setMode(savedMode);
        if (savedVariant) setVariant(savedVariant);
      }
    } catch (error) {
      console.warn('Failed to load theme preferences:', error);
    }
  }, []);

  // Save preferences
  const savePreferences = useCallback((newMode: ThemeMode, newVariant: ThemeVariant) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({
        mode: newMode,
        variant: newVariant,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to save theme preferences:', error);
    }
  }, []);

  // Get effective mode
  const effectiveMode = mode === 'auto' ? systemPreference : mode;

  // Get theme colors based on mode and variant
  const getThemeColors = useCallback((): ThemeColors => {
    let baseColors: ThemeColors;

    if (variant === 'high-contrast') {
      baseColors = highContrastTheme;
    } else if (variant === 'warm') {
      baseColors = warmTheme;
    } else if (variant === 'cool') {
      baseColors = coolTheme;
    } else if (effectiveMode === 'dark') {
      baseColors = darkTheme;
    } else {
      baseColors = lightTheme;
    }

    return baseColors;
  }, [effectiveMode, variant]);

  // Build complete theme config
  const theme: ThemeConfig = {
    mode: effectiveMode,
    variant,
    colors: getThemeColors(),
    shadows: {
      sm: effectiveMode === 'dark' ? '0 1px 2px rgba(0, 0, 0, 0.3)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: effectiveMode === 'dark' ? '0 4px 6px rgba(0, 0, 0, 0.4)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
      lg: effectiveMode === 'dark' ? '0 10px 15px rgba(0, 0, 0, 0.5)' : '0 10px 15px rgba(0, 0, 0, 0.1)',
      xl: effectiveMode === 'dark' ? '0 20px 25px rgba(0, 0, 0, 0.6)' : '0 20px 25px rgba(0, 0, 0, 0.1)',
    },
    transitions: {
      fast: '0.1s ease',
      normal: '0.2s ease',
      slow: '0.3s ease',
    },
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
  };

  // Apply theme to DOM
  const applyTheme = useCallback(() => {
    const root = document.documentElement;

    // Set CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    Object.entries(theme.transitions).forEach(([key, value]) => {
      root.style.setProperty(`--transition-${key}`, value);
    });

    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });

    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Update data attributes for conditional styling
    root.setAttribute('data-theme-mode', effectiveMode);
    root.setAttribute('data-theme-variant', variant);

    // Update color-scheme for system integration
    root.style.colorScheme = effectiveMode;

    // Update meta theme-color for mobile browsers
    const themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
    if (themeColorMeta) {
      themeColorMeta.content = theme.colors['bg-primary'];
    }
  }, [theme, effectiveMode, variant]);

  // Apply theme on changes
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  // Theme control functions
  const handleSetMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    savePreferences(newMode, variant);
  }, [variant, savePreferences]);

  const handleSetVariant = useCallback((newVariant: ThemeVariant) => {
    setVariant(newVariant);
    savePreferences(mode, newVariant);
  }, [mode, savePreferences]);

  const toggleMode = useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'auto' : 'light';
    handleSetMode(newMode);
  }, [mode, handleSetMode]);

  const resetToSystem = useCallback(() => {
    handleSetMode('auto');
    handleSetVariant('default');
  }, [handleSetMode, handleSetVariant]);

  const getThemeVariable = useCallback((key: keyof ThemeColors): string => {
    return theme.colors[key];
  }, [theme.colors]);

  return {
    theme,
    mode,
    variant,
    effectiveMode,
    systemPreference,
    setMode: handleSetMode,
    setVariant: handleSetVariant,
    toggleMode,
    resetToSystem,
    applyTheme,
    getThemeVariable,
  };
};

// Theme Provider Component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeHook = useTheme();

  return React.createElement(ThemeContext.Provider, { value: themeHook }, children);
};

// Hook to use theme context
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export default useTheme;