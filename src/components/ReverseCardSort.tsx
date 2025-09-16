import React, { useState } from 'react';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Study, Card, Category, CardSortResult } from '../types';

interface ReverseCardSortProps {
  study: Study;
  participantId: string;
  participantStartTime: number;
  onComplete: (result: CardSortResult) => void;
}

const ReverseCardSort: React.FC<ReverseCardSortProps> = ({
  study,
  participantId,
  participantStartTime,
  onComplete
}) => {
  // In reverse card sorting, we start with cards already in categories
  const [categories, setCategories] = useState<Category[]>(() => {
    // Distribute cards evenly across categories initially
    const categoriesWithCards: Category[] = study.categories.map(cat => ({ ...cat, cards: [] }));
    study.cards.forEach((card, index) => {
      const categoryIndex = index % study.categories.length;
      categoriesWithCards[categoryIndex].cards.push(card);
    });
    return categoriesWithCards;
  });
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [showInitialGrouping, setShowInitialGrouping] = useState(true);

  if (!study || !study.cards || study.cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Study Error</p>
          <p className="text-gray-600">This study has no cards to sort. Please contact the study administrator.</p>
        </div>
      </div>
    );
  }

  if (!study.categories || study.categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Study Error</p>
          <p className="text-gray-600">This study has no categories. Please contact the study administrator.</p>
        </div>
      </div>
    );
  }

  const handleDragStart = (_e: React.DragEvent, card: Card) => {
    setDraggedCard(card);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, categoryId: number) => {
    e.preventDefault();
    if (draggedCard) {
      // Remove card from its current category
      setCategories(prev => prev.map(cat => ({
        ...cat,
        cards: cat.cards.filter(card => card.id !== draggedCard.id)
      })));
      
      // Add card to target category
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, cards: [...cat.cards, draggedCard] }
          : cat
      ));
      
      setDraggedCard(null);
    }
  };

  const submitStudy = () => {
    const results: CardSortResult = {
      participantId,
      studyId: study.id,
      studyType: 'reverse-card-sorting',
      startTime: participantStartTime,
      completionTime: Date.now(),
      totalDuration: Date.now() - participantStartTime,
      cardSortResults: categories.map(cat => ({
        categoryId: cat.id,
        categoryName: cat.name,
        cards: cat.cards.map(card => ({ id: card.id, text: card.text }))
      }))
    };
    
    onComplete(results);
  };

  const totalCards = study.cards.length;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{study.name}</h1>
              <p className="text-sm text-gray-600">Reverse Card Sorting Study</p>
            </div>
            <div className="text-sm text-gray-500 flex-shrink-0">
              Participant: <span className="font-medium">{participantId}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-6 space-y-4 sm:space-y-6">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-orange-900 mb-3 flex items-center">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
            Instructions
          </h2>
          <div className="space-y-2 text-orange-800">
            <p className="text-sm sm:text-base leading-relaxed">
              The cards have been pre-grouped into categories. Review these groupings and move cards between categories to create groupings that make more sense to you.
            </p>
            <p className="text-sm text-orange-700">
              💡 <strong>Tip:</strong> Don't feel obligated to change everything - only move cards if you think they belong somewhere else!
            </p>
          </div>
        </div>

        {/* Show/Hide Initial Grouping Toggle */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => setShowInitialGrouping(!showInitialGrouping)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {showInitialGrouping ? (
              <EyeOff className="w-4 h-4 text-gray-600" />
            ) : (
              <Eye className="w-4 h-4 text-gray-600" />
            )}
            <span className="text-sm text-gray-700">
              {showInitialGrouping ? 'Hide' : 'Show'} category labels while sorting
            </span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(category => (
            <div
              key={category.id}
              className="bg-white p-4 border-2 border-solid border-gray-200 rounded-xl min-h-40 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, category.id)}
              role="region"
              aria-label={`Category: ${category.name}`}
            >
              {/* Category Header - conditionally shown */}
              {showInitialGrouping && (
                <h4 className="font-semibold mb-4 text-center bg-gradient-to-r from-gray-100 to-gray-200 py-3 rounded-lg text-gray-800 text-sm sm:text-base">
                  {category.name}
                  {category.cards.length > 0 && (
                    <span className="block text-xs text-gray-600 mt-1 font-normal">
                      {category.cards.length} card{category.cards.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </h4>
              )}

              {/* Hidden category header for accessibility */}
              {!showInitialGrouping && (
                <h4 className="sr-only">{category.name}</h4>
              )}

              <div className="space-y-2 min-h-16">
                {category.cards.map((card) => (
                  <div 
                    key={card.id} 
                    className="p-2 sm:p-3 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg text-sm font-medium text-orange-900 hover:from-orange-100 hover:to-orange-200 hover:shadow-md transition-all duration-200 cursor-move"
                    draggable
                    onDragStart={(e) => handleDragStart(e, card)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Move card: ${card.text}`}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="leading-tight">{card.text}</span>
                    </div>
                    {card.metadata?.description && (
                      <p className="text-xs text-orange-700 mt-1 opacity-75">{card.metadata.description}</p>
                    )}
                  </div>
                ))}
              </div>
              
              {category.cards.length === 0 && (
                <div className="flex items-center justify-center h-24 text-gray-400 text-sm italic border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <div className="text-center">
                    <div className="mb-1">📤</div>
                    <div>No cards</div>
                    <div className="text-xs">(Drop cards here)</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
          <div className="text-center sm:text-left">
            <div className="text-sm text-gray-600 mb-2">
              Total Cards: {totalCards} | Categories: {categories.length}
            </div>
            <div className="text-xs text-gray-500">
              Review the groupings and make changes as needed
            </div>
          </div>
          
          <button 
            onClick={submitStudy}
            className="px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 shadow-sm bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg"
            aria-label="Complete the reverse card sorting study"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm sm:text-base">Complete Study</span>
          </button>
        </div>

        {/* Help Text */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">
            <strong>How it works:</strong> In reverse card sorting, cards start in categories. 
            Your job is to review and reorganize them based on what makes sense to you.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Drag cards between categories to reorganize them. You can toggle category labels on/off to focus on the content.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReverseCardSort;