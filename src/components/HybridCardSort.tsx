import React, { useState, useCallback } from 'react';
import { CheckCircle, Plus, Edit2, Trash2, Shuffle, RotateCcw, Info } from 'lucide-react';
import { Study, Card, Category, CardSortResult, CategoryResult } from '../types';

interface HybridCardSortProps {
  study: Study;
  participantId: string;
  participantStartTime: number;
  onComplete: (result: CardSortResult) => void;
}

type HybridMode = 'closed' | 'open' | 'mixed';

interface HybridPhase {
  id: string;
  name: string;
  mode: HybridMode;
  description: string;
  allowModeSwitch: boolean;
}

const HybridCardSort: React.FC<HybridCardSortProps> = ({
  study,
  participantId,
  participantStartTime,
  onComplete
}) => {
  // Validation
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

  // Initialize hybrid phases
  const hybridPhases: HybridPhase[] = [
    {
      id: 'initial-closed',
      name: 'Initial Sorting',
      mode: 'closed',
      description: 'Start by sorting cards into the provided categories',
      allowModeSwitch: true
    },
    {
      id: 'open-refinement',
      name: 'Category Refinement',
      mode: 'open',
      description: 'Create new categories or refine existing ones',
      allowModeSwitch: true
    },
    {
      id: 'final-mixed',
      name: 'Final Review',
      mode: 'mixed',
      description: 'Make final adjustments using all available options',
      allowModeSwitch: false
    }
  ];

  // State management
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentMode, setCurrentMode] = useState<HybridMode>(hybridPhases[0].mode);
  const [unsortedCards, setUnsortedCards] = useState<Card[]>([...study.cards]);
  const [categories, setCategories] = useState<Category[]>(
    study.categories ? study.categories.map(cat => ({ ...cat, cards: [], isUserCreated: false })) : []
  );
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [showModeInfo, setShowModeInfo] = useState(true);

  // Hybrid mode capabilities
  const canCreateCategories = currentMode === 'open' || currentMode === 'mixed';
  const canEditCategories = currentMode === 'open' || currentMode === 'mixed';
  // const hasPresetCategories = study.categories && study.categories.length > 0;
  const showPresetCategories = currentMode === 'closed' || currentMode === 'mixed';

  // Category management
  const createCategory = useCallback(() => {
    if (!canCreateCategories || !newCategoryName.trim()) return;

    const maxId = Math.max(0, ...categories.map(cat => cat.id));
    const newCategory: Category = {
      id: maxId + 1,
      name: newCategoryName.trim(),
      cards: [],
      isUserCreated: true,
      color: `hsl(${Math.random() * 360}, 70%, 85%)`
    };

    setCategories(prev => [...prev, newCategory]);
    setNewCategoryName('');
  }, [newCategoryName, categories, canCreateCategories]);

  const deleteCategory = useCallback((categoryId: number) => {
    if (!canEditCategories) return;

    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    if (!categoryToDelete) return;

    // Move cards back to unsorted
    setUnsortedCards(prev => [...prev, ...categoryToDelete.cards]);
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  }, [categories, canEditCategories]);

  const editCategory = useCallback((categoryId: number, newName: string) => {
    if (!canEditCategories || !newName.trim()) return;

    setCategories(prev => prev.map(cat =>
      cat.id === categoryId ? { ...cat, name: newName.trim() } : cat
    ));
    setEditingCategoryId(null);
    setEditingCategoryName('');
  }, [canEditCategories]);

  // Drag and drop functionality
  const handleDragStart = useCallback((_e: React.DragEvent, card: Card) => {
    setDraggedCard(card);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, categoryId: number) => {
    e.preventDefault();
    if (!draggedCard) return;

    const sourceCategory = categories.find(cat =>
      cat.cards.some(card => card.id === draggedCard.id)
    );

    if (sourceCategory) {
      // Moving from category to category
      setCategories(prev => prev.map(cat => {
        if (cat.id === sourceCategory.id) {
          return { ...cat, cards: cat.cards.filter(card => card.id !== draggedCard.id) };
        }
        if (cat.id === categoryId) {
          return { ...cat, cards: [...cat.cards, draggedCard] };
        }
        return cat;
      }));
    } else {
      // Moving from unsorted to category
      setUnsortedCards(prev => prev.filter(card => card.id !== draggedCard.id));
      setCategories(prev => prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, cards: [...cat.cards, draggedCard] }
          : cat
      ));
    }

    setDraggedCard(null);
  }, [draggedCard, categories]);

  const handleDropToUnsorted = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedCard) return;

    const sourceCategory = categories.find(cat =>
      cat.cards.some(card => card.id === draggedCard.id)
    );

    if (sourceCategory) {
      setCategories(prev => prev.map(cat =>
        cat.id === sourceCategory.id
          ? { ...cat, cards: cat.cards.filter(card => card.id !== draggedCard.id) }
          : cat
      ));
      setUnsortedCards(prev => [...prev, draggedCard]);
    }

    setDraggedCard(null);
  }, [draggedCard, categories]);

  // Phase management
  const nextPhase = useCallback(() => {
    if (currentPhase < hybridPhases.length - 1) {
      const nextPhaseIndex = currentPhase + 1;
      setCurrentPhase(nextPhaseIndex);
      setCurrentMode(hybridPhases[nextPhaseIndex].mode);
      setShowModeInfo(true);
    }
  }, [currentPhase, hybridPhases]);

  const switchMode = useCallback((newMode: HybridMode) => {
    if (hybridPhases[currentPhase].allowModeSwitch) {
      setCurrentMode(newMode);
      setShowModeInfo(true);
    }
  }, [currentPhase, hybridPhases]);

  // Completion
  const completeSort = useCallback(() => {
    const allCategorized = categories.every(cat => cat.cards.length > 0) ||
      !study.settings?.requireAllCardsPlaced;

    if (!allCategorized && study.settings?.requireAllCardsPlaced) {
      alert('Please categorize all cards before completing the sort.');
      return;
    }

    // Convert categories to CategoryResult format for backward compatibility
    const categoryResults: CategoryResult[] = categories
      .filter(cat => cat.cards.length > 0)
      .map(cat => ({
        categoryId: cat.id,
        categoryName: cat.name,
        cards: cat.cards.map(card => ({ id: card.id, text: card.text })),
        isCustomCategory: cat.isUserCreated
      }));

    const result: CardSortResult = {
      participantId,
      studyId: study.id,
      studyType: 'hybrid-card-sorting',
      startTime: participantStartTime,
      completionTime: Date.now(),
      totalDuration: Date.now() - participantStartTime,
      cardSortResults: categoryResults, // Required for backward compatibility
      categories, // New unified structure for hybrid functionality
      uncategorizedCards: unsortedCards,
      hybridData: {
        phases: hybridPhases.map((phase, index) => ({
          ...phase,
          completed: index <= currentPhase,
          timeSpent: 0 // Would track actual time in production
        })),
        finalMode: currentMode,
        modesUsed: ['closed', 'open', 'mixed'], // Would track actual modes used
        categoriesCreated: categories.filter(cat => cat.isUserCreated).length,
        categoriesUsed: categories.filter(cat => cat.cards.length > 0).length
      }
    };

    onComplete(result);
  }, [categories, unsortedCards, study, participantId, participantStartTime, currentPhase, currentMode, hybridPhases, onComplete]);

  const currentPhaseData = hybridPhases[currentPhase];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with phase information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{study.name}</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Phase {currentPhase + 1} of {hybridPhases.length}
              </div>
              <div className="flex gap-2">
                {hybridPhases.map((phase, index) => (
                  <div
                    key={phase.id}
                    className={`w-3 h-3 rounded-full ${
                      index <= currentPhase ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Current phase info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">{currentPhaseData.name}</h3>
                <p className="text-blue-700 text-sm mt-1">{currentPhaseData.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-medium text-blue-800 bg-blue-100 px-2 py-1 rounded">
                    {currentMode.toUpperCase()} MODE
                  </span>
                  {currentPhaseData.allowModeSwitch && (
                    <span className="text-xs text-blue-600">Switch mode available</span>
                  )}
                </div>
              </div>
              {showModeInfo && (
                <button
                  onClick={() => setShowModeInfo(false)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Info className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Mode switching */}
          {currentPhaseData.allowModeSwitch && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => switchMode('closed')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  currentMode === 'closed'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Closed Sorting
              </button>
              <button
                onClick={() => switchMode('open')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  currentMode === 'open'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Open Sorting
              </button>
              <button
                onClick={() => switchMode('mixed')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  currentMode === 'mixed'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Mixed Mode
              </button>
            </div>
          )}

          {/* Progress indicator */}
          <div className="text-sm text-gray-600">
            {unsortedCards.length} cards remaining • {categories.filter(cat => cat.cards.length > 0).length} categories used
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Unsorted cards */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shuffle className="w-5 h-5" />
                Cards to Sort ({unsortedCards.length})
              </h2>
              <div
                className="min-h-24 border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50"
                onDragOver={handleDragOver}
                onDrop={handleDropToUnsorted}
              >
                {unsortedCards.map((card) => (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card)}
                    className="bg-white border border-gray-200 rounded-lg p-3 mb-2 cursor-move hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-2">
                      {card.icon && (
                        <div className="text-lg" style={{ color: card.icon.color }}>
                          {/* Icon would be rendered here */}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">{card.text}</span>
                    </div>
                    {card.image && (
                      <img
                        src={card.image.data}
                        alt={card.text}
                        className="w-full h-20 object-cover rounded mt-2"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Preset categories (shown in closed/mixed mode) */}
              {showPresetCategories && categories.filter(cat => !cat.isUserCreated).map((category) => (
                <div key={category.id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Preset
                    </span>
                  </div>
                  <div
                    className="min-h-24 border-2 border-dashed border-gray-300 rounded-lg p-3"
                    style={{ backgroundColor: category.color || '#f9fafb' }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, category.id)}
                  >
                    {category.cards.map((card) => (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, card)}
                        className="bg-white border border-gray-200 rounded-lg p-2 mb-2 cursor-move hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-2">
                          {card.icon && (
                            <div className="text-sm" style={{ color: card.icon.color }}>
                              {/* Icon would be rendered here */}
                            </div>
                          )}
                          <span className="text-sm text-gray-900">{card.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {category.cards.length} cards
                  </div>
                </div>
              ))}

              {/* User-created categories (shown in open/mixed mode) */}
              {categories.filter(cat => cat.isUserCreated).map((category) => (
                <div key={category.id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    {editingCategoryId === category.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          className="text-sm font-semibold border rounded px-2 py-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              editCategory(category.id, editingCategoryName);
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => editCategory(category.id, editingCategoryName)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    )}
                    <div className="flex items-center gap-1">
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        Custom
                      </span>
                      {canEditCategories && (
                        <>
                          <button
                            onClick={() => {
                              setEditingCategoryId(category.id);
                              setEditingCategoryName(category.name);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteCategory(category.id)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div
                    className="min-h-24 border-2 border-dashed border-gray-300 rounded-lg p-3"
                    style={{ backgroundColor: category.color || '#f9fafb' }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, category.id)}
                  >
                    {category.cards.map((card) => (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, card)}
                        className="bg-white border border-gray-200 rounded-lg p-2 mb-2 cursor-move hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-2">
                          {card.icon && (
                            <div className="text-sm" style={{ color: card.icon.color }}>
                              {/* Icon would be rendered here */}
                            </div>
                          )}
                          <span className="text-sm text-gray-900">{card.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {category.cards.length} cards
                  </div>
                </div>
              ))}

              {/* Add new category (open/mixed mode) */}
              {canCreateCategories && (
                <div className="bg-white rounded-lg shadow-sm p-4 border-2 border-dashed border-gray-300">
                  <div className="flex flex-col items-center justify-center h-full min-h-24">
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder="New category name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="text-sm border rounded px-3 py-2 text-center"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') createCategory();
                        }}
                      />
                    </div>
                    <button
                      onClick={createCategory}
                      disabled={!newCategoryName.trim()}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                    >
                      <Plus className="w-4 h-4" />
                      Add Category
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex justify-between items-center">
          <div className="flex gap-2">
            {currentPhase < hybridPhases.length - 1 && (
              <button
                onClick={nextPhase}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next Phase: {hybridPhases[currentPhase + 1].name}
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={completeSort}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Complete Sort
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HybridCardSort;