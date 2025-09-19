import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle, Plus, Edit2, Trash2, Shuffle, RotateCcw, Info, ArrowRight, ArrowLeft, Clock, Target } from 'lucide-react';
import { Study, Card, Category, CardSortResult, CategoryResult } from '../types';

interface SequentialCardSortProps {
  study: Study;
  participantId: string;
  participantStartTime: number;
  onComplete: (result: CardSortResult) => void;
}

interface SortingStage {
  id: string;
  name: string;
  description: string;
  objective: string;
  allowCreateCategories: boolean;
  allowEditCategories: boolean;
  allowDeleteCategories: boolean;
  minCardsPerCategory: number;
  maxUncategorized: number;
  validationRules: StageValidationRule[];
  completionCriteria: StageCriteria[];
}

interface StageValidationRule {
  id: string;
  name: string;
  description: string;
  validator: (categories: Category[], unsortedCards: Card[]) => boolean;
  errorMessage: string;
}

interface StageCriteria {
  id: string;
  name: string;
  description: string;
  required: boolean;
  checker: (categories: Category[], unsortedCards: Card[]) => boolean;
}

interface StageTransition {
  stageId: string;
  startTime: number;
  endTime?: number;
  categoriesAtStart: Category[];
  categoriesAtEnd?: Category[];
  unsortedAtStart: Card[];
  unsortedAtEnd?: Card[];
  validationPassed: boolean;
  userNotes?: string;
}

const SequentialCardSort: React.FC<SequentialCardSortProps> = ({
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

  // Define sequential stages
  const sortingStages: SortingStage[] = [
    {
      id: 'initial-grouping',
      name: 'Initial Grouping',
      description: 'Make your first pass at organizing the cards into logical groups',
      objective: 'Create broad, intuitive groupings without overthinking',
      allowCreateCategories: true,
      allowEditCategories: true,
      allowDeleteCategories: true,
      minCardsPerCategory: 1,
      maxUncategorized: Math.floor(study.cards.length * 0.2), // 20% can remain unsorted
      validationRules: [
        {
          id: 'min-categories',
          name: 'Minimum Categories',
          description: 'Must create at least 3 categories',
          validator: (categories) => categories.filter(cat => cat.cards.length > 0).length >= 3,
          errorMessage: 'Please create at least 3 categories with cards'
        }
      ],
      completionCriteria: [
        {
          id: 'most-cards-sorted',
          name: 'Most Cards Sorted',
          description: 'At least 80% of cards should be placed in categories',
          required: true,
          checker: (categories, unsorted) => {
            const totalCards = categories.reduce((sum, cat) => sum + cat.cards.length, 0) + unsorted.length;
            const sortedCards = categories.reduce((sum, cat) => sum + cat.cards.length, 0);
            return (sortedCards / totalCards) >= 0.8;
          }
        }
      ]
    },
    {
      id: 'refinement',
      name: 'Refinement',
      description: 'Review and refine your initial groupings',
      objective: 'Ensure each category makes sense and consider splitting or merging groups',
      allowCreateCategories: true,
      allowEditCategories: true,
      allowDeleteCategories: true,
      minCardsPerCategory: 2,
      maxUncategorized: Math.floor(study.cards.length * 0.1), // 10% can remain unsorted
      validationRules: [
        {
          id: 'min-cards-per-category',
          name: 'Cards Per Category',
          description: 'Each category should have at least 2 cards',
          validator: (categories) => categories.filter(cat => cat.cards.length > 0).every(cat => cat.cards.length >= 2),
          errorMessage: 'Each category must contain at least 2 cards'
        }
      ],
      completionCriteria: [
        {
          id: 'categories-named',
          name: 'Categories Named',
          description: 'All categories should have meaningful names',
          required: true,
          checker: (categories) => categories.filter(cat => cat.cards.length > 0).every(cat => cat.name.trim().length > 0)
        }
      ]
    },
    {
      id: 'finalization',
      name: 'Finalization',
      description: 'Make final adjustments and ensure you\'re satisfied with your organization',
      objective: 'Final review - this will be your submitted result',
      allowCreateCategories: false,
      allowEditCategories: true,
      allowDeleteCategories: false,
      minCardsPerCategory: 1,
      maxUncategorized: Math.floor(study.cards.length * 0.05), // 5% can remain unsorted
      validationRules: [
        {
          id: 'all-cards-sorted',
          name: 'Complete Sorting',
          description: 'All or nearly all cards should be categorized',
          validator: (categories, unsorted) => {
            const maxUnsorted = Math.floor((categories.reduce((sum, cat) => sum + cat.cards.length, 0) + unsorted.length) * 0.05);
            return unsorted.length <= maxUnsorted;
          },
          errorMessage: 'Please categorize at least 95% of cards before finalizing'
        }
      ],
      completionCriteria: [
        {
          id: 'satisfied-with-result',
          name: 'Satisfied with Organization',
          description: 'You should be confident in your final organization',
          required: true,
          checker: () => true // This is subjective - user confirms satisfaction
        }
      ]
    }
  ];

  // State management
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [unsortedCards, setUnsortedCards] = useState<Card[]>([...study.cards]);
  const [categories, setCategories] = useState<Category[]>(
    study.categories ? study.categories.map(cat => ({ ...cat, cards: [], isUserCreated: false })) : []
  );
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [stageTransitions, setStageTransitions] = useState<StageTransition[]>([]);
  const [stageStartTime, setStageStartTime] = useState(Date.now());
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showStageHelp, setShowStageHelp] = useState(true);
  const [userNotes, setUserNotes] = useState('');

  const currentStage = sortingStages[currentStageIndex];
  const isLastStage = currentStageIndex === sortingStages.length - 1;
  const isFirstStage = currentStageIndex === 0;

  // Stage transition effect
  useEffect(() => {
    setStageStartTime(Date.now());
    setShowStageHelp(true);
    setValidationErrors([]);
    setUserNotes('');
  }, [currentStageIndex]);

  // Validation logic
  const validateCurrentStage = useCallback(() => {
    const errors: string[] = [];

    // Check validation rules
    currentStage.validationRules.forEach(rule => {
      if (!rule.validator(categories, unsortedCards)) {
        errors.push(rule.errorMessage);
      }
    });

    // Check completion criteria
    currentStage.completionCriteria.forEach(criteria => {
      if (criteria.required && !criteria.checker(categories, unsortedCards)) {
        errors.push(`Required: ${criteria.description}`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  }, [currentStage, categories, unsortedCards]);

  // Category management
  const createCategory = useCallback(() => {
    if (!currentStage.allowCreateCategories || !newCategoryName.trim()) return;

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
  }, [newCategoryName, categories, currentStage.allowCreateCategories]);

  const deleteCategory = useCallback((categoryId: number) => {
    if (!currentStage.allowDeleteCategories) return;

    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    if (!categoryToDelete) return;

    // Move cards back to unsorted
    setUnsortedCards(prev => [...prev, ...categoryToDelete.cards]);
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  }, [categories, currentStage.allowDeleteCategories]);

  const editCategory = useCallback((categoryId: number, newName: string) => {
    if (!currentStage.allowEditCategories || !newName.trim()) return;

    setCategories(prev => prev.map(cat =>
      cat.id === categoryId ? { ...cat, name: newName.trim() } : cat
    ));
    setEditingCategoryId(null);
    setEditingCategoryName('');
  }, [currentStage.allowEditCategories]);

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

  // Stage navigation
  const nextStage = useCallback(() => {
    if (!validateCurrentStage()) {
      return;
    }

    // Record stage transition
    const transition: StageTransition = {
      stageId: currentStage.id,
      startTime: stageStartTime,
      endTime: Date.now(),
      categoriesAtStart: stageTransitions.length > 0 ? stageTransitions[stageTransitions.length - 1].categoriesAtEnd || [] : [],
      categoriesAtEnd: [...categories],
      unsortedAtStart: stageTransitions.length > 0 ? stageTransitions[stageTransitions.length - 1].unsortedAtEnd || [...study.cards] : [...study.cards],
      unsortedAtEnd: [...unsortedCards],
      validationPassed: true,
      userNotes: userNotes.trim()
    };

    setStageTransitions(prev => [...prev, transition]);

    if (isLastStage) {
      completeSort();
    } else {
      setCurrentStageIndex(prev => prev + 1);
    }
  }, [validateCurrentStage, currentStage, stageStartTime, stageTransitions, categories, unsortedCards, study.cards, userNotes, isLastStage]);

  const previousStage = useCallback(() => {
    if (isFirstStage) return;

    // Restore previous stage state
    const previousTransition = stageTransitions[stageTransitions.length - 1];
    if (previousTransition) {
      setCategories(previousTransition.categoriesAtStart);
      setUnsortedCards(previousTransition.unsortedAtStart);
      setStageTransitions(prev => prev.slice(0, -1));
    }

    setCurrentStageIndex(prev => prev - 1);
  }, [isFirstStage, stageTransitions]);

  // Completion
  const completeSort = useCallback(() => {
    if (!validateCurrentStage()) {
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
      studyType: 'card-sorting', // Sequential sorting is a variant of card sorting
      startTime: participantStartTime,
      completionTime: Date.now(),
      totalDuration: Date.now() - participantStartTime,
      cardSortResults: categoryResults,
      categories,
      uncategorizedCards: unsortedCards,
      sequentialData: {
        stages: sortingStages.map((stage, index) => ({
          ...stage,
          completed: index <= currentStageIndex,
          timeSpent: index < stageTransitions.length ?
            (stageTransitions[index].endTime || Date.now()) - stageTransitions[index].startTime :
            (index === currentStageIndex ? Date.now() - stageStartTime : 0)
        })),
        transitions: stageTransitions,
        totalStages: sortingStages.length,
        finalStage: currentStageIndex,
        categoriesEvolution: stageTransitions.map(t => ({
          stageId: t.stageId,
          categoriesCount: t.categoriesAtEnd?.filter(cat => cat.cards.length > 0).length || 0,
          cardsPerCategory: t.categoriesAtEnd?.map(cat => cat.cards.length) || [],
          userNotes: t.userNotes
        }))
      }
    };

    onComplete(result);
  }, [categories, unsortedCards, study, participantId, participantStartTime, currentStageIndex, sortingStages, stageTransitions, stageStartTime, validateCurrentStage, onComplete]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with stage information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{study.name}</h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Stage {currentStageIndex + 1} of {sortingStages.length}
              </div>
              <div className="flex gap-2">
                {sortingStages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                      index < currentStageIndex
                        ? 'bg-green-500 text-white'
                        : index === currentStageIndex
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {index < currentStageIndex ? '✓' : index + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current stage info */}
          {showStageHelp && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">{currentStage.name}</h3>
                  </div>
                  <p className="text-blue-700 text-sm mb-2">{currentStage.description}</p>
                  <p className="text-blue-800 text-sm font-medium">{currentStage.objective}</p>

                  {/* Stage capabilities */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {currentStage.allowCreateCategories && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Create Categories
                      </span>
                    )}
                    {currentStage.allowEditCategories && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Edit Categories
                      </span>
                    )}
                    {currentStage.allowDeleteCategories && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Delete Categories
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowStageHelp(false)}
                  className="text-blue-500 hover:text-blue-700 ml-4"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-red-900 mb-2">Please address the following:</h4>
              <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Progress and timing */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Stage time: {Math.floor((Date.now() - stageStartTime) / 1000)}s</span>
              </div>
              <div>
                {unsortedCards.length} cards remaining • {categories.filter(cat => cat.cards.length > 0).length} categories used
              </div>
            </div>
            {!showStageHelp && (
              <button
                onClick={() => setShowStageHelp(true)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Show stage info
              </button>
            )}
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
              {/* Existing categories */}
              {categories.map((category) => (
                <div key={category.id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    {editingCategoryId === category.id ? (
                      <div className="flex gap-2 flex-1">
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          className="text-sm font-semibold border rounded px-2 py-1 flex-1"
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
                      <h3 className="font-semibold text-gray-900 flex-1">{category.name}</h3>
                    )}
                    <div className="flex items-center gap-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        category.isUserCreated
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {category.isUserCreated ? 'Custom' : 'Preset'}
                      </span>
                      {currentStage.allowEditCategories && (
                        <button
                          onClick={() => {
                            setEditingCategoryId(category.id);
                            setEditingCategoryName(category.name);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {currentStage.allowDeleteCategories && category.isUserCreated && (
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

              {/* Add new category (if allowed) */}
              {currentStage.allowCreateCategories && (
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

        {/* Stage notes */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Stage Notes (Optional)</h3>
          <textarea
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder="Any thoughts or notes about your decisions in this stage..."
            className="w-full h-20 p-3 border border-gray-300 rounded-lg text-sm resize-none"
          />
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex justify-between items-center">
          <div className="flex gap-2">
            {!isFirstStage && (
              <button
                onClick={previousStage}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous Stage
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
              onClick={nextStage}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                validationErrors.length > 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isLastStage
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              disabled={validationErrors.length > 0}
            >
              {isLastStage ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Complete Sort
                </>
              ) : (
                <>
                  Next Stage
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequentialCardSort;