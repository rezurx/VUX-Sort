/**
 * ImageUpload Component
 * Handles image upload for rich card content with validation and preview
 * Following orchestrator guidance from frontend-ux-specialist
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (imageData: string, fileName: string) => void;
  onImageRemove: () => void;
  currentImage?: string;
  currentImageName?: string;
  disabled?: boolean;
  acceptedFormats?: string[];
  maxFileSize?: number; // in MB
  className?: string;
}

interface ImageValidationError {
  type: 'size' | 'format' | 'general';
  message: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  onImageRemove,
  currentImage,
  currentImageName,
  disabled = false,
  acceptedFormats = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'],
  maxFileSize = 5, // 5MB default
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<ImageValidationError | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file before processing
  const validateFile = (file: File): ImageValidationError | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return {
        type: 'size',
        message: `File size must be less than ${maxFileSize}MB. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`
      };
    }

    // Check file format
    if (!acceptedFormats.includes(file.type)) {
      return {
        type: 'format',
        message: `File format not supported. Accepted formats: ${acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`
      };
    }

    return null;
  };

  // Process uploaded file
  const processFile = useCallback(async (file: File) => {
    setError(null);
    setIsProcessing(true);

    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Convert to base64 for localStorage compatibility
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          // Compress image if needed (for JPEG/PNG)
          if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
            compressImage(result, file.name);
          } else {
            onImageUpload(result, file.name);
          }
        }
      };

      reader.onerror = () => {
        setError({
          type: 'general',
          message: 'Failed to read file. Please try again.'
        });
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError({
        type: 'general',
        message: 'An error occurred while processing the file.'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [onImageUpload, acceptedFormats, maxFileSize]);

  // Compress image for storage efficiency
  const compressImage = (imageData: string, fileName: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions (max 800px width/height for cards)
      const maxDimension = 800;
      let { width, height } = img;

      if (width > height && width > maxDimension) {
        height = (height * maxDimension) / width;
        width = maxDimension;
      } else if (height > maxDimension) {
        width = (width * maxDimension) / height;
        height = maxDimension;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      const compressedData = canvas.toDataURL('image/jpeg', 0.8); // 80% quality
      onImageUpload(compressedData, fileName);
    };

    img.src = imageData;
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      processFile(imageFile);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove current image
  const handleRemoveImage = () => {
    setError(null);
    onImageRemove();
  };

  return (
    <div className={`image-upload ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileChange}
        className="sr-only"
        disabled={disabled}
        aria-label="Upload image for card"
      />

      {/* Current image display */}
      {currentImage && (
        <div className="mb-4 relative group">
          <div className="relative inline-block">
            <img
              src={currentImage}
              alt={currentImageName || 'Card image'}
              className="max-w-full max-h-32 rounded-lg shadow-sm border border-gray-200"
            />
            {!disabled && (
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
            )}
          </div>
          {currentImageName && (
            <p className="text-sm text-gray-600 mt-1 truncate max-w-32">
              {currentImageName}
            </p>
          )}
        </div>
      )}

      {/* Upload area */}
      {!currentImage && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              triggerFileInput();
            }
          }}
          aria-label="Upload image area"
        >
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-sm text-gray-600">Processing image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {error ? (
                <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
              ) : (
                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
              )}

              <p className="text-sm font-medium text-gray-900 mb-1">
                {error ? 'Upload Failed' : 'Upload an image'}
              </p>

              <p className="text-xs text-gray-500">
                {error
                  ? error.message
                  : `Drag & drop or click to browse (max ${maxFileSize}MB)`
                }
              </p>

              {!error && (
                <p className="text-xs text-gray-400 mt-1">
                  Supports: {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upload button (alternative to drag & drop) */}
      {!currentImage && !error && (
        <button
          onClick={triggerFileInput}
          disabled={disabled || isProcessing}
          className="mt-3 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Choose image file"
        >
          <Upload className="h-4 w-4 mr-2" />
          Choose File
        </button>
      )}
    </div>
  );
};