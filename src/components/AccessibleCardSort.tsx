import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Move, ArrowRight, Info, Keyboard } from 'lucide-react';
import { Study, Card, Category, CardSortResult } from '../types';
import { useAccessibility } from '../hooks/useAccessibility';

interface AccessibleCardSortProps {
  study: Study;
  participantId: string;
  participantStartTime: number;
  onComplete: (result: CardSortResult) => void;
}

const AccessibleCardSort: React.FC<AccessibleCardSortProps> = ({
  study,
  participantId,
  participantStartTime,
  onComplete
}) => {
  const {
    announce,
    createAriaProps,
    addKeyboardShortcut,
    removeKeyboardShortcut,
    isHighContrast,
    reduceMotion
  } = useAccessibility({
    enableKeyboardNavigation: true,
    enableScreenReaderAnnouncements: true,
    enableFocusTrapping: true,
  });


  const [unsortedCards, setUnsortedCards] = useState<Card[]>([...study.cards]);
  const [categories, setCategories] = useState<Category[]>(
    study.categories.map(cat => ({ ...cat, cards: [] }))
  );
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  // Refs for managing focus
  const mainContentRef = useRef<HTMLDivElement>(null);
  const instructionsRef = useRef<HTMLDivElement>(null);
  const skipLinkRef = useRef<HTMLButtonElement>(null);

  // Instructions for screen readers and keyboard users
  const instructions = [
    "Welcome to the card sorting study. This is a fully accessible interface.",
    "Use Tab to navigate between cards and categories. Press Space to select a card.",
    "Use Arrow keys to navigate within lists. Press Enter to move a selected card.",
    "Press Escape to cancel selections or close dialogs.",
    "Press H to hear these instructions again, or S to skip to the main content."
  ];

  useEffect(() => {
    // Setup keyboard shortcuts
    addKeyboardShortcut('h', 'Repeat instructions', () => {
      setShowInstructions(true);
      announce(instructions[0]);
    });

    addKeyboardShortcut('s', 'Skip to main content', () => {
      if (mainContentRef.current) {
        mainContentRef.current.focus();
        announce('Skipped to main content');
      }
    });

    addKeyboardShortcut('i', 'Show card sorting information', () => {
      const totalCards = study.cards.length;
      const sortedCards = totalCards - unsortedCards.length;
      const progress = Math.round((sortedCards / totalCards) * 100);
      announce(`Card sorting progress: ${sortedCards} of ${totalCards} cards sorted. ${progress}% complete.`);
    });

    // Initial announcement
    announce(`Card sorting study loaded. ${study.cards.length} cards to sort into ${study.categories.length} categories. Press H for instructions.`);

    return () => {
      removeKeyboardShortcut('h');
      removeKeyboardShortcut('s');
      removeKeyboardShortcut('i');
    };
  }, [addKeyboardShortcut, removeKeyboardShortcut, announce, study, unsortedCards.length]);

  // Handle card selection
  const handleCardSelect = (card: Card) => {
    setSelectedCard(card);
    setSelectedCategory(null);
    announce(`Selected card: ${card.text}. ${card.metadata?.description ? card.metadata.description + '. ' : ''}Choose a category to move this card to.`);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    setSelectedCategory(categoryId);

    if (selectedCard) {
      moveCardToCategory(selectedCard.id, categoryId);
      announce(`Moved "${selectedCard.text}" to "${category.name}" category. ${category.cards.length + 1} cards now in this category.`);
      setSelectedCard(null);
      setSelectedCategory(null);
    } else {
      announce(`Selected category: ${category.name}. ${category.description ? category.description + '. ' : ''}${category.cards.length} cards currently in this category.`);
    }
  };

  // Move card to category
  const moveCardToCategory = (cardId: number, targetCategoryId: number) => {
    const card = findCardById(cardId);
    if (!card) return;

    // Remove from current location
    setUnsortedCards(prev => prev.filter(c => c.id !== cardId));
    setCategories(prev => prev.map(cat => ({
      ...cat,
      cards: cat.cards.filter(c => c.id !== cardId)
    })));

    // Add to target category
    setCategories(prev => prev.map(cat =>
      cat.id === targetCategoryId
        ? { ...cat, cards: [...cat.cards, card] }
        : cat
    ));
  };

  // Find card by ID
  const findCardById = (cardId: number): Card | undefined => {
    return [...unsortedCards, ...categories.flatMap(cat => cat.cards)]
      .find(c => c.id === cardId);
  };

  // Handle completion
  const handleComplete = () => {
    if (unsortedCards.length > 0) {
      announce(`Warning: ${unsortedCards.length} cards remain unsorted. Do you want to continue?`);
      const confirmed = window.confirm(`You have ${unsortedCards.length} unsorted cards. Are you sure you want to complete the study?`);
      if (!confirmed) return;
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

    announce('Card sorting study completed successfully. Thank you for your participation.');
    onComplete(result);
  };

  const progress = ((study.cards.length - unsortedCards.length) / study.cards.length) * 100;

  // Skip link
  const handleSkipToMain = () => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
      announce('Skipped to main content');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip Link */}
      <button
        ref={skipLinkRef}
        onClick={handleSkipToMain}
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded z-50"
        {...createAriaProps({ label: 'Skip to main content' })}
      >
        Skip to main content
      </button>

      {/* Instructions Modal */}
      {showInstructions && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          role="dialog"
          aria-labelledby="instructions-title"
          aria-describedby="instructions-content"
          ref={instructionsRef}
        >
          <div className="bg-white rounded-lg p-6 max-w-2xl mx-4 max-h-96 overflow-y-auto">
            <h2 id="instructions-title" className="text-xl font-semibold mb-4 flex items-center">
              <Info className="w-6 h-6 mr-2 text-blue-600" />
              Accessibility Instructions
            </h2>
            <div id="instructions-content" className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <Keyboard className="w-5 h-5 mr-2" />
                  Keyboard Navigation
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <kbd className="bg-white px-1 border rounded">Tab</kbd> - Navigate between elements</li>
                  <li>• <kbd className="bg-white px-1 border rounded">Space</kbd> - Select a card</li>
                  <li>• <kbd className="bg-white px-1 border rounded">Enter</kbd> - Move card to category</li>
                  <li>• <kbd className="bg-white px-1 border rounded">Arrow Keys</kbd> - Navigate within lists</li>
                  <li>• <kbd className="bg-white px-1 border rounded">Escape</kbd> - Cancel selection</li>
                  <li>• <kbd className="bg-white px-1 border rounded">H</kbd> - Repeat instructions</li>
                  <li>• <kbd className="bg-white px-1 border rounded">I</kbd> - Check progress</li>
                </ul>
              </div>
              <p className="text-gray-700">
                This interface is optimized for screen readers and keyboard navigation.
                All interactions can be completed without a mouse.
              </p>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowInstructions(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...createAriaProps({ label: 'Close instructions and start card sorting' })}
              >
                Start Card Sorting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Progress */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">
                {study.name}
              </h1>
              <div
                className="flex items-center space-x-4 mt-2"
                role="status"
                {...createAriaProps({
                  label: `Progress: ${Math.round(progress)}% complete, ${study.cards.length - unsortedCards.length} of ${study.cards.length} cards sorted`,
                  live: 'polite'
                })}
              >
                <div className="flex-1 bg-gray-200 rounded-full h-3 max-w-sm">
                  <div
                    className={`h-3 rounded-full transition-all ${reduceMotion ? '' : 'duration-300'} ${
                      progress < 30 ? 'bg-red-500' : progress < 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 min-w-0">
                  {Math.round(progress)}% Complete
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowInstructions(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-touch min-h-touch"
                {...createAriaProps({ label: 'Show accessibility instructions' })}
              >
                <Info className="w-4 h-4 mr-2 inline" />
                Help
              </button>
              <button
                onClick={handleComplete}
                disabled={categories.every(cat => cat.cards.length === 0)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-w-touch min-h-touch"
                {...createAriaProps({
                  label: `Complete card sorting study. ${unsortedCards.length} cards remain unsorted.`,
                  disabled: categories.every(cat => cat.cards.length === 0)
                })}
              >
                <CheckCircle className="w-4 h-4 mr-2 inline" />
                Complete Study
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        ref={mainContentRef}
        className="max-w-6xl mx-auto p-4"
        tabIndex={-1}
        {...createAriaProps({ label: 'Card sorting interface' })}
      >
        {/* Live Region for Announcements */}
        <div
          id="live-region"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />

        {/* Unsorted Cards Section */}
        {unsortedCards.length > 0 && (
          <section className="mb-8" aria-labelledby="unsorted-heading">
            <h2 id="unsorted-heading" className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Move className="w-5 h-5 mr-2 text-gray-600" />
              Cards to Sort ({unsortedCards.length})
            </h2>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              role="group"
              {...createAriaProps({ label: `${unsortedCards.length} unsorted cards` })}
            >
              {unsortedCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardSelect(card)}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleCardSelect(card);
                    }
                  }}
                  className={`
                    text-left p-4 rounded-lg border-2 transition-all min-h-touch
                    ${selectedCard?.id === card.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : isHighContrast
                      ? 'border-black bg-white hover:border-gray-800'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${reduceMotion ? '' : 'transform hover:scale-105 active:scale-95'}
                  `}
                  {...createAriaProps({
                    label: `Card: ${card.text}. ${card.metadata?.description || ''} Press to select this card.`,
                    selected: selectedCard?.id === card.id,
                    role: 'button'
                  })}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-base mb-1">
                        {card.text}
                      </h3>
                      {card.metadata?.description && (
                        <p className="text-sm text-gray-600">
                          {card.metadata.description}
                        </p>
                      )}
                    </div>
                    {selectedCard?.id === card.id && (
                      <div className="ml-3 text-blue-500" aria-hidden="true">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Categories Section */}
        <section aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="text-lg font-semibold text-gray-900 mb-4">
            Categories ({categories.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`
                  border-2 rounded-lg p-4 transition-all
                  ${selectedCategory === category.id
                    ? 'border-green-500 bg-green-50'
                    : isHighContrast
                    ? 'border-black bg-white'
                    : 'border-gray-200 bg-gray-50'
                  }
                  ${selectedCard ? 'hover:border-green-400 hover:bg-green-25' : ''}
                `}
              >
                <button
                  onClick={() => handleCategorySelect(category.id)}
                  disabled={!selectedCard}
                  className={`
                    w-full text-left p-2 rounded-lg transition-colors min-h-touch
                    ${!selectedCard
                      ? 'cursor-default'
                      : isHighContrast
                      ? 'hover:bg-gray-200 focus:bg-gray-200'
                      : 'hover:bg-white focus:bg-white'
                    }
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                  `}
                  {...createAriaProps({
                    label: `Category: ${category.name}. ${category.description || ''} ${category.cards.length} cards currently in this category. ${selectedCard ? `Press to move ${selectedCard.text} here.` : 'Select a card first to move it here.'}`,
                    disabled: !selectedCard,
                    role: 'button'
                  })}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {category.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span
                        className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm font-medium"
                        {...createAriaProps({ label: `${category.cards.length} cards` })}
                      >
                        {category.cards.length}
                      </span>
                      {selectedCard && (
                        <ArrowRight className="w-4 h-4 text-green-600" aria-hidden="true" />
                      )}
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {category.description}
                    </p>
                  )}
                </button>

                {/* Cards in Category */}
                {category.cards.length > 0 && (
                  <div
                    className="space-y-2 mt-3"
                    role="list"
                    {...createAriaProps({ label: `${category.cards.length} cards in ${category.name}` })}
                  >
                    {category.cards.map((card, index) => (
                      <div
                        key={card.id}
                        role="listitem"
                        className={`
                          p-3 rounded border transition-colors
                          ${isHighContrast
                            ? 'bg-white border-black'
                            : 'bg-white border-gray-200'
                          }
                        `}
                        {...createAriaProps({
                          label: `Card ${index + 1}: ${card.text} ${card.metadata?.description ? '. ' + card.metadata.description : ''}`
                        })}
                      >
                        <h4 className="font-medium text-gray-900 text-sm">
                          {card.text}
                        </h4>
                        {card.metadata?.description && (
                          <p className="text-xs text-gray-600 mt-1">
                            {card.metadata.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Selected Card Instructions */}
        {selectedCard && (
          <div
            className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm"
            role="status"
            {...createAriaProps({
              label: `Selected card: ${selectedCard.text}. Choose a category to move it to.`,
              live: 'polite'
            })}
          >
            <p className="text-sm">
              <strong>Selected:</strong> {selectedCard.text}<br />
              Click a category to move this card there.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AccessibleCardSort;