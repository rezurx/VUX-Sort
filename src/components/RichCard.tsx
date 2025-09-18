/**
 * RichCard Component
 * Enhanced card component with image and icon support
 * Following orchestrator guidance for responsive design and accessibility
 */

import React, { useState, useCallback } from 'react';
import { Card } from '../types';
import * as LucideIcons from 'lucide-react';

interface RichCardProps {
  card: Card;
  isDragging?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  className?: string;
  showMetadata?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: React.CSSProperties;
}

export const RichCard: React.FC<RichCardProps> = ({
  card,
  isDragging = false,
  isSelected = false,
  onClick,
  onDoubleClick,
  className = '',
  showMetadata = false,
  size = 'medium',
  style = {}
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get size classes
  const sizeClasses = {
    small: 'min-h-[60px] p-2 text-sm',
    medium: 'min-h-[80px] p-3 text-base',
    large: 'min-h-[100px] p-4 text-lg'
  };

  // Handle image load error
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Handle image load success
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  // Get Lucide icon component
  const getIconComponent = (iconName: string): React.ComponentType<any> | null => {
    const IconComponent = (LucideIcons as any)[iconName];
    return (typeof IconComponent === 'function') ? IconComponent : null;
  };

  // Render visual content (image or icon)
  const renderVisualContent = () => {
    const hasImage = card.image && !imageError;
    const hasIcon = card.icon;

    if (!hasImage && !hasIcon) return null;

    return (
      <div className="flex-shrink-0 mr-3">
        {/* Image display */}
        {hasImage && (
          <div className="relative">
            <img
              src={card.image!.data}
              alt={`Visual content for ${card.text}`}
              className={`
                object-cover rounded border border-gray-200
                ${size === 'small' ? 'w-10 h-10' : ''}
                ${size === 'medium' ? 'w-12 h-12' : ''}
                ${size === 'large' ? 'w-16 h-16' : ''}
                ${!imageLoaded ? 'opacity-0' : 'opacity-100'}
                transition-opacity duration-200
              `}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />

            {/* Loading placeholder */}
            {!imageLoaded && !imageError && (
              <div
                className={`
                  absolute inset-0 bg-gray-100 rounded animate-pulse
                  flex items-center justify-center
                `}
              >
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
              </div>
            )}
          </div>
        )}

        {/* Icon display (if no image or image failed) */}
        {hasIcon && (!hasImage || imageError) && (
          <div className="flex items-center justify-center">
            {(() => {
              const IconComponent = getIconComponent(card.icon!.name);
              if (!IconComponent) return null;

              const iconSize = card.icon!.size || (
                size === 'small' ? 16 :
                size === 'medium' ? 20 : 24
              );

              return (
                <IconComponent
                  size={iconSize}
                  color={card.icon!.color || 'currentColor'}
                  className="flex-shrink-0"
                  aria-hidden="true"
                />
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  // Render metadata
  const renderMetadata = () => {
    if (!showMetadata || !card.metadata) return null;

    const visibleMetadata = [];

    if (card.metadata.complexity) {
      visibleMetadata.push(
        <span key="complexity" className={`
          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
          ${card.metadata.complexity === 'high' ? 'bg-red-100 text-red-800' :
            card.metadata.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'}
        `}>
          {card.metadata.complexity}
        </span>
      );
    }

    if (card.metadata.tags && card.metadata.tags.length > 0) {
      visibleMetadata.push(
        ...card.metadata.tags.slice(0, 2).map((tag, index) => (
          <span key={`tag-${index}`} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {tag}
          </span>
        ))
      );
    }

    if (visibleMetadata.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {visibleMetadata}
      </div>
    );
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        bg-white border-2 rounded-lg shadow-sm cursor-grab transition-all duration-200
        flex items-start
        ${isDragging ? 'shadow-lg scale-105 rotate-2 cursor-grabbing border-blue-400' : ''}
        ${isSelected ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200 hover:border-gray-300'}
        ${onClick ? 'hover:shadow-md' : ''}
        focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-300
        ${className}
      `}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={style}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`Card: ${card.text}`}
      aria-describedby={card.metadata?.description ? `card-desc-${card.id}` : undefined}
    >
      {/* Visual content */}
      {renderVisualContent()}

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 break-words">
          {card.text}
        </div>

        {/* Description */}
        {card.metadata?.description && (
          <div
            id={`card-desc-${card.id}`}
            className="text-sm text-gray-600 mt-1 line-clamp-2"
          >
            {card.metadata.description}
          </div>
        )}

        {/* Metadata */}
        {renderMetadata()}
      </div>

      {/* Visual content indicator */}
      {(card.image || card.icon) && (
        <div className="sr-only">
          {card.image && "Contains image content"}
          {card.icon && "Contains icon content"}
        </div>
      )}
    </div>
  );
};