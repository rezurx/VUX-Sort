/**
 * RichCardCreator Component
 * Enhanced card creation interface with image and icon support
 * Integrates ImageUpload and IconSelector components
 */

import React, { useState, useCallback } from 'react';
import { Card } from '../types';
import { ImageUpload } from './ImageUpload';
import { IconSelector } from './IconSelector';
import { RichCard } from './RichCard';
import { Image as ImageIcon, Sparkles, Eye, Trash2 } from 'lucide-react';

interface RichCardCreatorProps {
  onCardCreate: (card: Omit<Card, 'id'>) => void;
  onCardUpdate?: (card: Card) => void;
  editingCard?: Card;
  onCancel?: () => void;
  className?: string;
}

export const RichCardCreator: React.FC<RichCardCreatorProps> = ({
  onCardCreate,
  onCardUpdate,
  editingCard,
  onCancel,
  className = ''
}) => {
  const [cardText, setCardText] = useState(editingCard?.text || '');
  const [cardDescription, setCardDescription] = useState(editingCard?.metadata?.description || '');
  const [cardImage, setCardImage] = useState(editingCard?.image || undefined);
  const [cardIcon, setCardIcon] = useState(editingCard?.icon || undefined);
  const [complexity, setComplexity] = useState<'low' | 'medium' | 'high'>(
    editingCard?.metadata?.complexity || 'medium'
  );
  const [tags, setTags] = useState<string[]>(editingCard?.metadata?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Handle image upload
  const handleImageUpload = useCallback((imageData: string, fileName: string) => {
    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      setCardImage({
        data: imageData,
        fileName,
        fileSize: Math.round(imageData.length * 0.75), // Approximate size
        mimeType: imageData.split(';')[0].split(':')[1],
        dimensions: { width: img.width, height: img.height }
      });
    };
    img.src = imageData;
  }, []);

  // Handle image removal
  const handleImageRemove = useCallback(() => {
    setCardImage(undefined);
  }, []);

  // Handle icon selection
  const handleIconSelect = useCallback((iconName: string) => {
    setCardIcon({
      name: iconName,
      color: cardIcon?.color || 'currentColor',
      size: cardIcon?.size || 20
    });
  }, [cardIcon]);

  // Handle icon removal
  const handleIconRemove = useCallback(() => {
    setCardIcon(undefined);
  }, []);

  // Handle tag addition
  const handleAddTag = useCallback(() => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  }, [newTag, tags]);

  // Handle tag removal
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }, [tags]);

  // Generate preview card
  const getPreviewCard = useCallback((): Card => {
    const hasVisualContent = Boolean(cardImage || cardIcon);
    const visualContentType = cardImage && cardIcon ? 'both' :
                             cardImage ? 'image' :
                             cardIcon ? 'icon' : undefined;

    return {
      id: editingCard?.id || 0,
      text: cardText || 'Card text...',
      image: cardImage,
      icon: cardIcon,
      metadata: {
        description: cardDescription || undefined,
        complexity,
        tags: tags.length > 0 ? tags : undefined,
        hasVisualContent,
        visualContentType
      }
    };
  }, [cardText, cardDescription, cardImage, cardIcon, complexity, tags, editingCard]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!cardText.trim()) return;

    const cardData = getPreviewCard();

    if (editingCard && onCardUpdate) {
      onCardUpdate({ ...cardData, id: editingCard.id });
    } else {
      const { id, ...cardWithoutId } = cardData;
      onCardCreate(cardWithoutId);
    }

    // Reset form
    setCardText('');
    setCardDescription('');
    setCardImage(undefined);
    setCardIcon(undefined);
    setComplexity('medium');
    setTags([]);
    setNewTag('');
  }, [cardText, onCardCreate, onCardUpdate, editingCard, getPreviewCard]);

  // Handle form reset
  const handleReset = useCallback(() => {
    setCardText('');
    setCardDescription('');
    setCardImage(undefined);
    setCardIcon(undefined);
    setComplexity('medium');
    setTags([]);
    setNewTag('');
    onCancel?.();
  }, [onCancel]);

  return (
    <div className={`rich-card-creator ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Text */}
        <div>
          <label htmlFor="card-text" className="block text-sm font-medium text-gray-700 mb-2">
            Card Text *
          </label>
          <input
            id="card-text"
            type="text"
            value={cardText}
            onChange={(e) => setCardText(e.target.value)}
            placeholder="Enter card text..."
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Card Description */}
        <div>
          <label htmlFor="card-description" className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            id="card-description"
            value={cardDescription}
            onChange={(e) => setCardDescription(e.target.value)}
            placeholder="Add a description for this card..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Visual Content Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Visual Content</h3>

          {/* Image Upload */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              <ImageIcon className="inline w-4 h-4 mr-1" />
              Card Image
            </label>
            <ImageUpload
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              currentImage={cardImage?.data}
              currentImageName={cardImage?.fileName}
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              <Sparkles className="inline w-4 h-4 mr-1" />
              Card Icon
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowIconSelector(true)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
              >
                {cardIcon ? 'Change Icon' : 'Select Icon'}
              </button>

              {cardIcon && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded">
                    {(() => {
                      const LucideIcons = require('lucide-react');
                      const IconComponent = LucideIcons[cardIcon.name] || LucideIcons.Help;
                      return React.createElement(IconComponent, { size: 16, color: cardIcon.color });
                    })()}
                    <span className="text-sm text-gray-600">{cardIcon.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleIconRemove}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove icon"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Metadata</h3>

          {/* Complexity */}
          <div>
            <label htmlFor="complexity" className="block text-sm text-gray-600 mb-2">
              Complexity
            </label>
            <select
              id="complexity"
              value={complexity}
              onChange={(e) => setComplexity(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Tags</label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                      aria-label={`Remove ${tag} tag`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Preview</label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Eye className="w-4 h-4 mr-1" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
          </div>

          {showPreview && (
            <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
              <RichCard
                card={getPreviewCard()}
                showMetadata={true}
                size="medium"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
          >
            {editingCard ? 'Cancel' : 'Reset'}
          </button>

          <button
            type="submit"
            disabled={!cardText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingCard ? 'Update Card' : 'Create Card'}
          </button>
        </div>
      </form>

      {/* Icon Selector Modal */}
      <IconSelector
        selectedIcon={cardIcon?.name}
        onIconSelect={handleIconSelect}
        onRemoveIcon={handleIconRemove}
        isOpen={showIconSelector}
        onClose={() => setShowIconSelector(false)}
        iconColor={cardIcon?.color}
        iconSize={cardIcon?.size}
      />
    </div>
  );
};