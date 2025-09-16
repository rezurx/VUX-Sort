import React, { useState } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { Study, Card, Category, StudySettings } from '../types';

interface StudyCreatorProps {
  study?: Study;
  onSave: (study: Study) => void;
  onCancel: () => void;
}

const StudyCreator: React.FC<StudyCreatorProps> = ({ study, onSave, onCancel }) => {
  const [studyName, setStudyName] = useState(study?.name || '');
  const [studyDescription, setStudyDescription] = useState(study?.description || '');
  const [cards, setCards] = useState<Card[]>(study?.cards || []);
  const [categories, setCategories] = useState<Category[]>(
    study?.categories || [{ id: 1, name: '', cards: [] }]
  );
  const [settings, setSettings] = useState<StudySettings>(study?.settings || {
    maxParticipants: 50,
    minParticipants: 10,
    allowCustomCategories: false,
    shuffleCards: true,
    showCardNumbers: false,
    allowUncategorized: false,
    requireAllCardsPlaced: true,
    showProgress: true,
    allowPause: true,
    theme: 'default'
  });
  const [newCardText, setNewCardText] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const addCard = () => {
    if (newCardText.trim()) {
      const newCard: Card = {
        id: Date.now() + Math.random(),
        text: newCardText.trim()
      };
      setCards([...cards, newCard]);
      setNewCardText('');
    }
  };

  const removeCard = (cardId: number) => {
    setCards(cards.filter(card => card.id !== cardId));
  };

  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: Date.now() + Math.random(),
        name: newCategoryName.trim(),
        cards: []
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
    }
  };

  const removeCategory = (categoryId: number) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
  };

  const updateCategoryName = (categoryId: number, name: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId ? { ...cat, name } : cat
    ));
  };

  const handleSave = () => {
    if (!studyName.trim()) {
      alert('Please enter a study name');
      return;
    }
    
    if (cards.length === 0) {
      alert('Please add at least one card');
      return;
    }
    
    if (categories.length === 0 || categories.some(cat => !cat.name.trim())) {
      alert('Please add at least one category with a name');
      return;
    }

    const newStudy: Study = {
      id: study?.id || Date.now(),
      name: studyName.trim(),
      description: studyDescription.trim(),
      type: 'card-sorting',
      cards,
      categories: categories.filter(cat => cat.name.trim()),
      participants: study?.participants || 0,
      created: study?.created || new Date().toISOString(),
      updated: new Date().toISOString(),
      settings
    };

    onSave(newStudy);
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {study ? 'Edit Study' : 'Create New Card Sorting Study'}
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Study Name *
                  </label>
                  <input
                    type="text"
                    value={studyName}
                    onChange={(e) => setStudyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter study name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={studyDescription}
                    onChange={(e) => setStudyDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter study description"
                  />
                </div>
              </div>
            </div>

            {/* Cards Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cards ({cards.length})</h3>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCardText}
                    onChange={(e) => setNewCardText(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, addCard)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter card text"
                  />
                  <button
                    onClick={addCard}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Card</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {cards.map(card => (
                    <div key={card.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm text-blue-900 flex-1 mr-2">{card.text}</span>
                      <button
                        onClick={() => removeCard(card.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Categories ({categories.length})</h3>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, addCategory)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter category name"
                  />
                  <button
                    onClick={addCategory}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categories.map(category => (
                    <div key={category.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => updateCategoryName(category.id, e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent mr-2"
                        placeholder="Category name"
                      />
                      <button
                        onClick={() => removeCategory(category.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Study Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    value={settings.maxParticipants}
                    onChange={(e) => setSettings({...settings, maxParticipants: parseInt(e.target.value) || 50})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Participants
                  </label>
                  <input
                    type="number"
                    value={settings.minParticipants}
                    onChange={(e) => setSettings({...settings, minParticipants: parseInt(e.target.value) || 10})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.shuffleCards}
                    onChange={(e) => setSettings({...settings, shuffleCards: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Shuffle cards for each participant</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.showProgress}
                    onChange={(e) => setSettings({...settings, showProgress: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show progress indicator</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.allowPause}
                    onChange={(e) => setSettings({...settings, allowPause: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow participants to pause</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.requireAllCardsPlaced}
                    onChange={(e) => setSettings({...settings, requireAllCardsPlaced: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Require all cards to be placed</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-1"
            >
              <Save className="w-4 h-4" />
              <span>Save Study</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyCreator;