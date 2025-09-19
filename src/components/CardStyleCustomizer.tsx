import React, { useState } from 'react';
import { Palette, Save, RotateCcw, Eye, EyeOff, Settings } from 'lucide-react';
import { Card, Category } from '../types';

export interface CardStyle {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  borderWidth: number;
  borderRadius: number;
  shadow: 'none' | 'sm' | 'md' | 'lg';
  fontSize: 'xs' | 'sm' | 'base' | 'lg';
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  padding: 'sm' | 'md' | 'lg';
}

export interface CategoryStyle {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  headerBackgroundColor: string;
  headerTextColor: string;
  borderWidth: number;
  borderRadius: number;
  shadow: 'none' | 'sm' | 'md' | 'lg';
  minHeight: number;
}

export interface StyleTheme {
  id: string;
  name: string;
  description: string;
  cardStyle: CardStyle;
  categoryStyle: CategoryStyle;
  globalStyles: {
    fontFamily: string;
    backgroundColor: string;
    accentColor: string;
  };
}

interface CardStyleCustomizerProps {
  currentTheme?: StyleTheme;
  sampleCards: Card[];
  sampleCategories: Category[];
  onThemeChange: (theme: StyleTheme) => void;
  onClose: () => void;
}

const CardStyleCustomizer: React.FC<CardStyleCustomizerProps> = ({
  currentTheme,
  sampleCards,
  sampleCategories,
  onThemeChange,
  onClose
}) => {
  // Predefined themes
  const predefinedThemes: StyleTheme[] = [
    {
      id: 'default',
      name: 'Default',
      description: 'Clean and minimal design',
      cardStyle: {
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        textColor: '#111827',
        borderWidth: 1,
        borderRadius: 8,
        shadow: 'sm',
        fontSize: 'sm',
        fontWeight: 'medium',
        padding: 'md'
      },
      categoryStyle: {
        backgroundColor: '#f9fafb',
        borderColor: '#d1d5db',
        textColor: '#374151',
        headerBackgroundColor: '#f3f4f6',
        headerTextColor: '#111827',
        borderWidth: 2,
        borderRadius: 8,
        shadow: 'sm',
        minHeight: 120
      },
      globalStyles: {
        fontFamily: 'Inter, system-ui, sans-serif',
        backgroundColor: '#f9fafb',
        accentColor: '#3b82f6'
      }
    },
    {
      id: 'warm',
      name: 'Warm',
      description: 'Warm tones with soft edges',
      cardStyle: {
        backgroundColor: '#fef7ed',
        borderColor: '#fed7aa',
        textColor: '#9a3412',
        borderWidth: 2,
        borderRadius: 12,
        shadow: 'md',
        fontSize: 'sm',
        fontWeight: 'medium',
        padding: 'lg'
      },
      categoryStyle: {
        backgroundColor: '#fff7ed',
        borderColor: '#fed7aa',
        textColor: '#9a3412',
        headerBackgroundColor: '#ffedd5',
        headerTextColor: '#c2410c',
        borderWidth: 2,
        borderRadius: 12,
        shadow: 'md',
        minHeight: 140
      },
      globalStyles: {
        fontFamily: 'Inter, system-ui, sans-serif',
        backgroundColor: '#fffbeb',
        accentColor: '#ea580c'
      }
    },
    {
      id: 'cool',
      name: 'Cool',
      description: 'Cool blues and grays',
      cardStyle: {
        backgroundColor: '#eff6ff',
        borderColor: '#bfdbfe',
        textColor: '#1e40af',
        borderWidth: 1,
        borderRadius: 6,
        shadow: 'sm',
        fontSize: 'sm',
        fontWeight: 'semibold',
        padding: 'md'
      },
      categoryStyle: {
        backgroundColor: '#f0f9ff',
        borderColor: '#7dd3fc',
        textColor: '#0c4a6e',
        headerBackgroundColor: '#e0f2fe',
        headerTextColor: '#075985',
        borderWidth: 2,
        borderRadius: 8,
        shadow: 'md',
        minHeight: 130
      },
      globalStyles: {
        fontFamily: 'Inter, system-ui, sans-serif',
        backgroundColor: '#f8fafc',
        accentColor: '#0ea5e9'
      }
    },
    {
      id: 'high-contrast',
      name: 'High Contrast',
      description: 'Bold colors for accessibility',
      cardStyle: {
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        textColor: '#000000',
        borderWidth: 3,
        borderRadius: 4,
        shadow: 'lg',
        fontSize: 'base',
        fontWeight: 'bold',
        padding: 'lg'
      },
      categoryStyle: {
        backgroundColor: '#f5f5f5',
        borderColor: '#000000',
        textColor: '#000000',
        headerBackgroundColor: '#e5e5e5',
        headerTextColor: '#000000',
        borderWidth: 3,
        borderRadius: 4,
        shadow: 'lg',
        minHeight: 150
      },
      globalStyles: {
        fontFamily: 'Inter, system-ui, sans-serif',
        backgroundColor: '#ffffff',
        accentColor: '#000000'
      }
    },
    {
      id: 'pastel',
      name: 'Pastel',
      description: 'Soft pastels and rounded corners',
      cardStyle: {
        backgroundColor: '#fce7f3',
        borderColor: '#f9a8d4',
        textColor: '#be185d',
        borderWidth: 1,
        borderRadius: 16,
        shadow: 'sm',
        fontSize: 'sm',
        fontWeight: 'medium',
        padding: 'lg'
      },
      categoryStyle: {
        backgroundColor: '#fdf2f8',
        borderColor: '#f9a8d4',
        textColor: '#be185d',
        headerBackgroundColor: '#fce7f3',
        headerTextColor: '#be185d',
        borderWidth: 1,
        borderRadius: 16,
        shadow: 'sm',
        minHeight: 130
      },
      globalStyles: {
        fontFamily: 'Inter, system-ui, sans-serif',
        backgroundColor: '#fefcfe',
        accentColor: '#ec4899'
      }
    }
  ];

  const [selectedTheme, setSelectedTheme] = useState<StyleTheme>(currentTheme || predefinedThemes[0]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const [customCardStyle, setCustomCardStyle] = useState<CardStyle>(selectedTheme.cardStyle);
  const [customCategoryStyle, setCustomCategoryStyle] = useState<CategoryStyle>(selectedTheme.categoryStyle);

  const handleThemeSelect = (theme: StyleTheme) => {
    setSelectedTheme(theme);
    setCustomCardStyle(theme.cardStyle);
    setCustomCategoryStyle(theme.categoryStyle);
    setIsCustomizing(false);
  };

  const handleCustomCardStyleChange = (key: keyof CardStyle, value: any) => {
    setCustomCardStyle(prev => ({ ...prev, [key]: value }));
    updateThemeWithCustomStyles();
  };

  const handleCustomCategoryStyleChange = (key: keyof CategoryStyle, value: any) => {
    setCustomCategoryStyle(prev => ({ ...prev, [key]: value }));
    updateThemeWithCustomStyles();
  };

  const updateThemeWithCustomStyles = () => {
    setSelectedTheme(prev => ({
      ...prev,
      cardStyle: customCardStyle,
      categoryStyle: customCategoryStyle
    }));
  };

  const resetToDefault = () => {
    const defaultTheme = predefinedThemes[0];
    setSelectedTheme(defaultTheme);
    setCustomCardStyle(defaultTheme.cardStyle);
    setCustomCategoryStyle(defaultTheme.categoryStyle);
    setIsCustomizing(false);
  };

  const applyTheme = () => {
    onThemeChange(selectedTheme);
    onClose();
  };

  const getCardStyleCSS = (style: CardStyle) => ({
    backgroundColor: style.backgroundColor,
    borderColor: style.borderColor,
    color: style.textColor,
    borderWidth: `${style.borderWidth}px`,
    borderRadius: `${style.borderRadius}px`,
    fontSize: style.fontSize === 'xs' ? '12px' : style.fontSize === 'sm' ? '14px' : style.fontSize === 'base' ? '16px' : '18px',
    fontWeight: style.fontWeight,
    padding: style.padding === 'sm' ? '8px' : style.padding === 'md' ? '12px' : '16px',
    boxShadow: style.shadow === 'none' ? 'none' :
               style.shadow === 'sm' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' :
               style.shadow === 'md' ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' :
               '0 10px 15px -3px rgb(0 0 0 / 0.1)'
  });

  const getCategoryStyleCSS = (style: CategoryStyle) => ({
    backgroundColor: style.backgroundColor,
    borderColor: style.borderColor,
    color: style.textColor,
    borderWidth: `${style.borderWidth}px`,
    borderRadius: `${style.borderRadius}px`,
    minHeight: `${style.minHeight}px`,
    boxShadow: style.shadow === 'none' ? 'none' :
               style.shadow === 'sm' ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' :
               style.shadow === 'md' ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' :
               '0 10px 15px -3px rgb(0 0 0 / 0.1)'
  });

  const getCategoryHeaderStyleCSS = (style: CategoryStyle) => ({
    backgroundColor: style.headerBackgroundColor,
    color: style.headerTextColor,
    borderRadius: `${style.borderRadius}px ${style.borderRadius}px 0 0`,
    padding: '12px 16px',
    fontWeight: '600'
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Card Style Customizer</h2>
              <p className="text-purple-100 mt-1">Customize the appearance of your study interface</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-1 px-3 py-1 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {previewMode ? 'Hide Preview' : 'Show Preview'}
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Customization Panel */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Theme Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Preset Themes
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {predefinedThemes.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeSelect(theme)}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        selectedTheme.id === theme.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{theme.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{theme.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Styling */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Custom Styling
                  <button
                    onClick={() => setIsCustomizing(!isCustomizing)}
                    className="ml-auto text-sm text-purple-600 hover:text-purple-800"
                  >
                    {isCustomizing ? 'Hide' : 'Show'}
                  </button>
                </h3>

                {isCustomizing && (
                  <div className="space-y-4">
                    {/* Card Styling */}
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Card Appearance</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                          <input
                            type="color"
                            value={customCardStyle.backgroundColor}
                            onChange={(e) => handleCustomCardStyleChange('backgroundColor', e.target.value)}
                            className="w-full h-8 rounded border"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Border Color</label>
                          <input
                            type="color"
                            value={customCardStyle.borderColor}
                            onChange={(e) => handleCustomCardStyleChange('borderColor', e.target.value)}
                            className="w-full h-8 rounded border"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                          <input
                            type="color"
                            value={customCardStyle.textColor}
                            onChange={(e) => handleCustomCardStyleChange('textColor', e.target.value)}
                            className="w-full h-8 rounded border"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius</label>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={customCardStyle.borderRadius}
                            onChange={(e) => handleCustomCardStyleChange('borderRadius', parseInt(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-500">{customCardStyle.borderRadius}px</span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                          <select
                            value={customCardStyle.fontSize}
                            onChange={(e) => handleCustomCardStyleChange('fontSize', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-1 text-sm"
                          >
                            <option value="xs">Extra Small</option>
                            <option value="sm">Small</option>
                            <option value="base">Base</option>
                            <option value="lg">Large</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Category Styling */}
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Category Appearance</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                          <input
                            type="color"
                            value={customCategoryStyle.backgroundColor}
                            onChange={(e) => handleCustomCategoryStyleChange('backgroundColor', e.target.value)}
                            className="w-full h-8 rounded border"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Header Background</label>
                          <input
                            type="color"
                            value={customCategoryStyle.headerBackgroundColor}
                            onChange={(e) => handleCustomCategoryStyleChange('headerBackgroundColor', e.target.value)}
                            className="w-full h-8 rounded border"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Min Height</label>
                          <input
                            type="range"
                            min="80"
                            max="200"
                            value={customCategoryStyle.minHeight}
                            onChange={(e) => handleCustomCategoryStyleChange('minHeight', parseInt(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-500">{customCategoryStyle.minHeight}px</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          {previewMode && (
            <div className="flex-1 overflow-y-auto" style={{ backgroundColor: selectedTheme.globalStyles.backgroundColor }}>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Live Preview
                </h3>

                {/* Sample Cards */}
                <div className="mb-8">
                  <h4 className="font-medium text-gray-800 mb-3">Sample Cards</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {sampleCards.slice(0, 4).map((card, index) => (
                      <div
                        key={index}
                        className="border cursor-move"
                        style={getCardStyleCSS(selectedTheme.cardStyle)}
                      >
                        {card.text}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Categories */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Sample Categories</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {sampleCategories.slice(0, 2).map((category, index) => (
                      <div
                        key={index}
                        className="border border-dashed"
                        style={getCategoryStyleCSS(selectedTheme.categoryStyle)}
                      >
                        <div style={getCategoryHeaderStyleCSS(selectedTheme.categoryStyle)}>
                          {category.name}
                        </div>
                        <div className="p-3 space-y-2">
                          {category.cards.slice(0, 2).map((card, cardIndex) => (
                            <div
                              key={cardIndex}
                              className="border"
                              style={getCardStyleCSS(selectedTheme.cardStyle)}
                            >
                              {card.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Theme: {selectedTheme.name}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={resetToDefault}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={applyTheme}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                Apply Theme
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardStyleCustomizer;