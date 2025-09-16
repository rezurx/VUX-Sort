import React, { useState } from 'react';
import { CheckCircle, Plus, Edit2, Trash2 } from 'lucide-react';
import { Study, Card, Category, CardSortResult } from '../types';

interface OpenCardSortProps {
  study: Study;
  participantId: string;
  participantStartTime: number;
  onComplete: (result: CardSortResult) => void;
}

const OpenCardSort: React.FC<OpenCardSortProps> = ({
  study,
  participantId,
  participantStartTime,
  onComplete
}) => {
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

  const [unsortedCards, setUnsortedCards] = useState<Card[]>([...study.cards]);
  const [categories, setCategories] = useState<Category[]>(
    study.settings.sortType === 'hybrid' 
      ? study.categories.map(cat => ({ ...cat, cards: [], isUserCreated: false }))
      : []
  );
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const handleDragStart = (_e: React.DragEvent, card: Card) => {
    setDraggedCard(card);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, categoryId: number) => {
    e.preventDefault();
    if (draggedCard) {
      // Remove card from unsorted cards
      setUnsortedCards(prev => prev.filter(card => card.id !== draggedCard.id));
      
      // Remove card from any existing category
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

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const maxCategories = study.settings.maxCustomCategories || 10;
      if (categories.length >= maxCategories) {
        alert(`You can create a maximum of ${maxCategories} categories.`);
        return;
      }

      const newCategory: Category = {
        id: Date.now() + Math.random(),
        name: newCategoryName.trim(),
        cards: [],
        isUserCreated: true
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
    }
  };

  const deleteCategory = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category && category.isUserCreated) {
      // Move cards back to unsorted
      setUnsortedCards(prev => [...prev, ...category.cards]);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
  };

  const startEditingCategory = (category: Category) => {
    if (category.isUserCreated) {
      setEditingCategoryId(category.id);
      setEditingCategoryName(category.name);
    }
  };

  const saveEditingCategory = () => {
    if (editingCategoryName.trim() && editingCategoryId) {
      setCategories(prev => prev.map(cat =>
        cat.id === editingCategoryId
          ? { ...cat, name: editingCategoryName.trim() }
          : cat
      ));
      setEditingCategoryId(null);
      setEditingCategoryName('');
    }
  };

  const cancelEditingCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const submitStudy = () => {
    if (categories.length === 0) {
      alert('Please create at least one category to organize your cards.');
      return;
    }

    const minCards = study.settings.minCardsPerCategory || 1;
    const categoriesWithTooFewCards = categories.filter(cat => cat.cards.length < minCards);
    
    if (categoriesWithTooFewCards.length > 0) {
      alert(`Each category must have at least ${minCards} card${minCards > 1 ? 's' : ''}. Please redistribute cards.`);
      return;
    }

    const results: CardSortResult = {
      participantId,
      studyId: study.id,
      studyType: study.type as 'open-card-sorting',
      startTime: participantStartTime,
      completionTime: Date.now(),
      totalDuration: Date.now() - participantStartTime,
      cardSortResults: categories.map(cat => ({
        categoryId: cat.id,
        categoryName: cat.name,
        cards: cat.cards.map(card => ({ id: card.id, text: card.text })),
        isCustomCategory: cat.isUserCreated
      })),
      customCategories: categories
        .filter(cat => cat.isUserCreated)
        .map(cat => ({
          categoryId: cat.id,
          categoryName: cat.name,
          cards: cat.cards.map(card => ({ id: card.id, text: card.text })),
          isCustomCategory: true
        }))
    };
    
    onComplete(results);
  };

  const isComplete = unsortedCards.length === 0;
  const allowUncategorized = study.settings.allowUncategorized;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{study.name}</h1>
              <p className="text-sm text-gray-600">
                {study.type === 'open-card-sorting' ? 'Open Card Sorting' : 'Hybrid Card Sorting'} Study
              </p>
            </div>
            <div className="text-sm text-gray-500 flex-shrink-0">
              Participant: <span className="font-medium">{participantId}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4 sm:px-6 space-y-4 sm:space-y-6">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
            Instructions
          </h2>
          <div className="space-y-2 text-purple-800">
            <p className="text-sm sm:text-base leading-relaxed">
              {study.type === 'open-card-sorting' 
                ? 'Create your own categories and drag the cards into groups that make sense to you.'
                : 'You can use the provided categories or create your own. Drag cards into groups that make sense to you.'
              }
            </p>
            <p className="text-sm text-purple-700">
              💡 <strong>Tip:</strong> Think about how you would naturally group these items. There are no wrong answers!
            </p>
          </div>
        </div>

        {/* Create Category Section */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Create New Category</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCategory()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter category name"
              maxLength={50}
            />
            <button
              onClick={addCategory}
              disabled={!newCategoryName.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
          {study.settings.maxCustomCategories && (
            <p className="text-xs text-gray-500 mt-2">
              You can create up to {study.settings.maxCustomCategories} categories 
              ({categories.filter(cat => cat.isUserCreated).length} created)
            </p>
          )}
        </div>
        
        {unsortedCards.length > 0 && (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Cards to Sort</h3>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {unsortedCards.length} remaining
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {unsortedCards.map(card => (
                <div
                  key={card.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card)}
                  className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg cursor-move hover:from-purple-100 hover:to-purple-200 hover:shadow-md transition-all duration-200 font-medium text-purple-900 text-sm sm:text-base select-none"
                  role="button"
                  tabIndex={0}
                  aria-label={`Drag card: ${card.text}`}
                >
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 flex-shrink-0"></div>
                    <span className="leading-tight">{card.text}</span>
                  </div>
                  {card.metadata?.description && (
                    <p className="text-xs text-purple-700 mt-1 opacity-75">{card.metadata.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(category => (
            <div
              key={category.id}
              className="bg-white p-4 border-2 border-dashed border-gray-200 rounded-xl min-h-40 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, category.id)}
              role="region"
              aria-label={`Category: ${category.name}`}
            >
              <div className="flex items-center justify-between mb-4">
                {editingCategoryId === category.id ? (
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') saveEditingCategory();
                        if (e.key === 'Escape') cancelEditingCategory();
                      }}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                      autoFocus
                    />
                    <button
                      onClick={saveEditingCategory}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <h4 className="font-semibold text-center bg-gradient-to-r from-gray-100 to-gray-200 py-3 px-4 rounded-lg text-gray-800 text-sm sm:text-base flex-1 flex items-center justify-center">
                    <span className="truncate">{category.name}</span>
                    {category.isUserCreated && (
                      <div className="ml-2 flex space-x-1">
                        <button
                          onClick={() => startEditingCategory(category)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          title="Edit category name"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Delete category"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </h4>
                )}
              </div>

              {category.cards.length > 0 && (
                <div className="text-xs text-gray-600 text-center mb-2">
                  {category.cards.length} card{category.cards.length !== 1 ? 's' : ''}
                </div>
              )}

              <div className="space-y-2 min-h-16">
                {category.cards.map((card) => (
                  <div 
                    key={card.id} 
                    className="p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg text-sm font-medium text-green-900 hover:bg-green-100 transition-colors duration-150"
                    draggable
                    onDragStart={(e) => handleDragStart(e, card)}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 flex-shrink-0"></div>
                      <span className="leading-tight">{card.text}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {category.cards.length === 0 && (
                <div className="flex items-center justify-center h-16 text-gray-400 text-sm italic border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <div className="mb-1">📤</div>
                    <div>Drop cards here</div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Empty state for first category */}
          {categories.length === 0 && (
            <div className="col-span-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Create Your First Category</h3>
              <p className="text-gray-600">
                Start by creating a category above, then drag cards into it.
              </p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
          <div className="text-center sm:text-left">
            <div className="text-sm text-gray-600 mb-2">
              Progress: {study.cards.length - unsortedCards.length} of {study.cards.length} cards sorted
            </div>
            <div className="w-48 sm:w-64 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((study.cards.length - unsortedCards.length) / study.cards.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <button 
            onClick={submitStudy}
            disabled={!isComplete && !allowUncategorized}
            className={`px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 shadow-sm ${
              (isComplete || allowUncategorized) && categories.length > 0
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            aria-label={
              isComplete 
                ? 'Complete the study' 
                : `Sort ${unsortedCards.length} more cards to continue`
            }
          >
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm sm:text-base">
              {isComplete || allowUncategorized
                ? 'Complete Study' 
                : `Sort ${unsortedCards.length} more card${unsortedCards.length !== 1 ? 's' : ''}`
              }
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenCardSort;