/**
 * IconSelector Component
 * Allows users to select icons from the Lucide React library
 * Following orchestrator guidance for accessibility and user experience
 */

import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface IconSelectorProps {
  selectedIcon?: string;
  onIconSelect: (iconName: string) => void;
  onRemoveIcon: () => void;
  isOpen: boolean;
  onClose: () => void;
  iconColor?: string;
  iconSize?: number;
}

// Popular icons for quick access
const POPULAR_ICONS = [
  'Home', 'User', 'Settings', 'Search', 'Heart', 'Star', 'Mail', 'Phone',
  'Calendar', 'Clock', 'MapPin', 'Camera', 'Image', 'File', 'Folder',
  'Download', 'Upload', 'Share', 'Link', 'Edit', 'Trash2', 'Plus',
  'Minus', 'Check', 'X', 'ChevronRight', 'ChevronLeft', 'ChevronUp',
  'ChevronDown', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'
];

// Category mapping for better organization
const ICON_CATEGORIES = {
  'Interface': ['Home', 'Settings', 'Search', 'Menu', 'Grid', 'List', 'Filter', 'Sort'],
  'Actions': ['Plus', 'Minus', 'Edit', 'Trash2', 'Save', 'Download', 'Upload', 'Share'],
  'Navigation': ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ChevronRight', 'ChevronLeft'],
  'Communication': ['Mail', 'Phone', 'MessageCircle', 'Send', 'Bell', 'Volume2'],
  'Media': ['Image', 'Camera', 'Video', 'Music', 'Play', 'Pause', 'Stop'],
  'Files': ['File', 'Folder', 'FileText', 'Download', 'Upload', 'Archive'],
  'Social': ['Heart', 'Star', 'ThumbsUp', 'Share', 'Users', 'UserPlus'],
  'Commerce': ['ShoppingCart', 'CreditCard', 'DollarSign', 'Package', 'Truck'],
  'Time': ['Calendar', 'Clock', 'Timer', 'Watch', 'Sunrise', 'Sunset'],
  'Location': ['MapPin', 'Map', 'Navigation', 'Compass', 'Globe']
};

export const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  onIconSelect,
  onRemoveIcon,
  isOpen,
  onClose,
  iconColor = 'currentColor',
  iconSize = 20
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Popular');

  // Get all available icons
  const availableIcons = useMemo(() => {
    return Object.keys(LucideIcons).filter(name => {
      // Filter out non-icon exports
      const icon = (LucideIcons as any)[name];
      return typeof icon === 'function' && name !== 'Icon';
    });
  }, []);

  // Filter icons based on search and category
  const filteredIcons = useMemo(() => {
    let icons = selectedCategory === 'Popular'
      ? POPULAR_ICONS
      : selectedCategory === 'All'
      ? availableIcons
      : ICON_CATEGORIES[selectedCategory as keyof typeof ICON_CATEGORIES] || [];

    if (searchTerm) {
      icons = icons.filter(name =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return icons;
  }, [searchTerm, selectedCategory, availableIcons]);

  // Render icon component
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;

    return (
      <IconComponent
        size={iconSize}
        color={iconColor}
        aria-hidden="true"
      />
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Select an Icon</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close icon selector"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current selection */}
        {selectedIcon && (
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Current:</span>
                <div className="flex items-center space-x-2 px-2 py-1 bg-white rounded border">
                  {renderIcon(selectedIcon)}
                  <span className="text-sm text-gray-600">{selectedIcon}</span>
                </div>
              </div>
              <button
                onClick={onRemoveIcon}
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Remove Icon
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Search icons"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 py-2 border-b">
          <div className="flex flex-wrap gap-2">
            {['Popular', 'All', ...Object.keys(ICON_CATEGORIES)].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-3 py-1 text-sm rounded-full transition-colors
                  ${selectedCategory === category
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Icon grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredIcons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? `No icons found for "${searchTerm}"` : 'No icons in this category'}
            </div>
          ) : (
            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
              {filteredIcons.map((iconName) => (
                <button
                  key={iconName}
                  onClick={() => {
                    onIconSelect(iconName);
                    onClose();
                  }}
                  className={`
                    p-2 rounded-md border transition-all hover:bg-gray-50 hover:border-gray-300
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${selectedIcon === iconName
                      ? 'bg-blue-50 border-blue-300'
                      : 'border-gray-200'
                    }
                  `}
                  title={iconName}
                  aria-label={`Select ${iconName} icon`}
                >
                  <div className="flex items-center justify-center">
                    {renderIcon(iconName)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
          {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} available
        </div>
      </div>
    </div>
  );
};