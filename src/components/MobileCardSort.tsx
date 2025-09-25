import React, { useState, useRef } from 'react';
import { Move, MoreVertical, X, ChevronDown } from 'lucide-react';
import { Study, Card, Category, CardSortResult } from '../types';

interface MobileCardSortProps {
  study: Study;
  participantId: string;
  participantStartTime: number;
  onComplete: (result: CardSortResult) => void;
}

interface TouchPosition {
  x: number;
  y: number;
}

const MobileCardSort: React.FC<MobileCardSortProps> = ({
  study,
  participantId,
  participantStartTime,
  onComplete
}) => {
  if (!study?.cards?.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-red-600 font-semibold text-lg">Study Error</p>
          <p className="text-gray-600 mt-2">This study has no cards to sort. Please contact the study administrator.</p>
        </div>
      </div>
    );
  }

  if (!study?.categories?.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-red-600 font-semibold text-lg">Study Error</p>
          <p className="text-gray-600 mt-2">This study has no categories. Please contact the study administrator.</p>
        </div>
      </div>
    );
  }

  const [unsortedCards, setUnsortedCards] = useState<Card[]>([...study.cards]);
  const [categories, setCategories] = useState<Category[]>(
    study.categories.map(cat => ({ ...cat, cards: [] }))
  );

  // Mobile-specific state
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState<TouchPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  // Touch gesture thresholds
  const DRAG_THRESHOLD = 10;
  const LONG_PRESS_DURATION = 500;

  const touchTimeoutRef = useRef<NodeJS.Timeout>();
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Mobile touch handlers
  const handleTouchStart = (e: React.TouchEvent, card: Card) => {
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });

    // Start long press timer for drag mode
    touchTimeoutRef.current = setTimeout(() => {
      if (!isDragging) {
        setDraggedCard(card);
        setIsDragging(true);
        // Haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    }, LONG_PRESS_DURATION);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.y);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > DRAG_THRESHOLD && touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);

      if (!isDragging) {
        setIsDragging(true);
      }
    }

    // Highlight categories during drag
    if (isDragging && draggedCard) {
      const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
      const categoryElement = elementAtPoint?.closest('[data-category-id]');

      if (categoryElement) {
        const categoryIdStr = categoryElement.getAttribute('data-category-id');
        const categoryId = categoryIdStr ? Number(categoryIdStr) : null;
        setActiveCategory(categoryId);
      } else {
        setActiveCategory(null);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }

    if (isDragging && draggedCard && activeCategory) {
      // Complete the drag operation
      moveCardToCategory(draggedCard.id, activeCategory);
    } else if (!isDragging && touchStartPos) {
      // Simple tap - show category selector
      const touch = e.changedTouches[0];
      const deltaX = Math.abs(touch.clientX - touchStartPos.x);
      const deltaY = Math.abs(touch.clientY - touchStartPos.y);

      if (deltaX < DRAG_THRESHOLD && deltaY < DRAG_THRESHOLD) {
        // This was a tap, not a drag
        const cardElement = e.currentTarget as HTMLElement;
        const cardIdStr = cardElement.getAttribute('data-card-id');
        const cardId = cardIdStr ? Number(cardIdStr) : null;
        const card = [...unsortedCards, ...categories.flatMap(cat => cat.cards)]
          .find(c => c.id === cardId);

        if (card) {
          setSelectedCard(card);
          setShowCategorySelector(true);
        }
      }
    }

    // Reset drag state
    setTouchStartPos(null);
    setIsDragging(false);
    setDraggedCard(null);
    setActiveCategory(null);
  };

  // Card movement logic
  const moveCardToCategory = (cardId: number, targetCategoryId: number | string) => {
    const card = findCardById(cardId);
    if (!card) return;

    // Remove card from current location
    setUnsortedCards(prev => prev.filter(c => c.id !== cardId));
    setCategories(prev => prev.map(cat => ({
      ...cat,
      cards: cat.cards.filter(c => c.id !== cardId)
    })));

    // Add card to target category
    if (typeof targetCategoryId === 'string' && targetCategoryId === 'unsorted') {
      setUnsortedCards(prev => [...prev, card]);
    } else if (typeof targetCategoryId === 'number') {
      setCategories(prev => prev.map(cat =>
        cat.id === targetCategoryId
          ? { ...cat, cards: [...cat.cards, card] }
          : cat
      ));
    }
  };

  const findCardById = (cardId: number): Card | undefined => {
    return [...unsortedCards, ...categories.flatMap(cat => cat.cards)]
      .find(c => c.id === cardId);
  };

  // Category selection handler
  const handleCategorySelection = (categoryId: string | number) => {
    if (selectedCard) {
      if (categoryId === 'unsorted') {
        // Return card to unsorted pile
        setCategories(prev => prev.map(cat => ({
          ...cat,
          cards: cat.cards.filter(c => c.id !== selectedCard.id)
        })));
        setUnsortedCards(prev => [...prev, selectedCard]);
      } else if (typeof categoryId === 'number') {
        moveCardToCategory(selectedCard.id, categoryId);
      }
      setSelectedCard(null);
      setShowCategorySelector(false);
    }
  };

  // Completion logic
  const handleComplete = () => {
    if (unsortedCards.length > 0) {
      const confirmComplete = window.confirm(
        `You have ${unsortedCards.length} unsorted cards. Are you sure you want to complete the study?`
      );
      if (!confirmComplete) return;
    }

    const completionTime = Date.now();
    const result: CardSortResult = {
      participantId,
      studyId: study.id,
      studyType: study.type as CardSortResult['studyType'],
      startTime: participantStartTime,
      completionTime,
      totalDuration: completionTime - participantStartTime,
      cardSortResults: categories.map(cat => ({
        categoryId: cat.id,
        categoryName: cat.name,
        cards: cat.cards.map(card => ({ id: card.id, text: card.text }))
      })),
      uncategorizedCards: [...unsortedCards]
    };

    onComplete(result);
  };

  const progress = ((study.cards.length - unsortedCards.length) / study.cards.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-Optimized Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {study.name}
            </h1>
            <div className="flex items-center space-x-3 mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 font-medium min-w-0">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <button
            onClick={handleComplete}
            disabled={categories.every(cat => cat.cards.length === 0)}
            className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg font-medium disabled:bg-gray-300 disabled:text-gray-500 text-sm"
          >
            Complete
          </button>
        </div>
      </div>

      {/* Mobile Instructions */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
        <p className="text-sm text-blue-800">
          <strong>Mobile Instructions:</strong> Tap a card to select a category, or long-press and drag to move it directly.
        </p>
      </div>

      <div className="p-4 pb-20">
        {/* Unsorted Cards Section */}
        {unsortedCards.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Move className="w-5 h-5 mr-2 text-gray-600" />
              Cards to Sort ({unsortedCards.length})
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {unsortedCards.map((card) => (
                <div
                  key={card.id}
                  data-card-id={card.id}
                  ref={(el) => el && cardRefs.current.set(card.id.toString(), el)}
                  className={`
                    bg-white rounded-lg border-2 p-4 cursor-pointer select-none
                    ${isDragging && draggedCard?.id === card.id
                      ? 'border-blue-500 bg-blue-50 transform scale-105 shadow-lg'
                      : 'border-gray-200'
                    }
                    ${selectedCard?.id === card.id ? 'border-blue-400 bg-blue-50' : ''}
                    active:scale-95 transition-all duration-150
                    touch-none
                  `}
                  onTouchStart={(e) => handleTouchStart(e, card)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{ touchAction: 'none' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-base leading-tight">
                        {card.text}
                      </h3>
                      {card.metadata?.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {card.metadata.description}
                        </p>
                      )}
                    </div>
                    <MoreVertical className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Categories
          </h2>
          {categories.map((category) => (
            <div
              key={category.id}
              data-category-id={category.id}
              className={`
                bg-white rounded-lg border-2 p-4
                ${activeCategory === category.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200'
                }
                transition-all duration-200
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-base">
                  {category.name}
                </h3>
                <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
                  {category.cards.length}
                </div>
              </div>

              {category.description && (
                <p className="text-sm text-gray-600 mb-3">
                  {category.description}
                </p>
              )}

              {category.cards.length > 0 && (
                <div className="space-y-2">
                  {category.cards.map((card) => (
                    <div
                      key={card.id}
                      data-card-id={card.id}
                      className="bg-gray-50 rounded p-3 border border-gray-200"
                      onTouchStart={(e) => handleTouchStart(e, card)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      style={{ touchAction: 'none' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {card.text}
                          </h4>
                          {card.metadata?.description && (
                            <p className="text-xs text-gray-600 mt-1">
                              {card.metadata.description}
                            </p>
                          )}
                        </div>
                        <MoreVertical className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Category Selection Modal */}
      {showCategorySelector && selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-xl p-4 pb-safe">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Move "{selectedCard.text}"
              </h3>
              <button
                onClick={() => {
                  setSelectedCard(null);
                  setShowCategorySelector(false);
                }}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {/* Back to unsorted option */}
              <button
                onClick={() => handleCategorySelection('unsorted')}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 active:bg-gray-100"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    Return to unsorted cards
                  </span>
                  <ChevronDown className="w-5 h-5 text-gray-400 transform rotate-270" />
                </div>
              </button>

              {/* Category options */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelection(category.id)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">
                        {category.name}
                      </span>
                      <div className="text-sm text-gray-600 mt-1">
                        {category.cards.length} cards
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400 transform rotate-270" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Drag Feedback */}
      {isDragging && draggedCard && (
        <div className="fixed top-4 left-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-40 text-center">
          <p className="text-sm font-medium">
            Dragging "{draggedCard.text}" - Drop on a category
          </p>
        </div>
      )}

      {/* Safe area padding for bottom */}
      <div className="h-safe-bottom" />
    </div>
  );
};

export default MobileCardSort;