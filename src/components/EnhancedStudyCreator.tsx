import React, { useState } from 'react';
import { Plus, Trash2, Save, X, Upload, FolderTree, Shuffle, Target } from 'lucide-react';
import { Study, Card, Category, StudySettings, StudyType, TreeNode, BulkUploadData } from '../types';
import BulkUpload from './BulkUpload';

interface EnhancedStudyCreatorProps {
  study?: Study;
  onSave: (study: Study) => void;
  onCancel: () => void;
}

const EnhancedStudyCreator: React.FC<EnhancedStudyCreatorProps> = ({ study, onSave, onCancel }) => {
  const [studyName, setStudyName] = useState(study?.name || '');
  const [studyDescription, setStudyDescription] = useState(study?.description || '');
  const [studyType, setStudyType] = useState<StudyType>(study?.type || 'card-sorting');
  const [cards, setCards] = useState<Card[]>(study?.cards || []);
  const [categories, setCategories] = useState<Category[]>(
    study?.categories || []
  );
  const [treeStructure, setTreeStructure] = useState<TreeNode[]>(study?.treeStructure || []);
  const [tasks, setTasks] = useState<string[]>(study?.tasks || []);
  
  const [settings, setSettings] = useState<StudySettings>(study?.settings || {
    maxParticipants: 50,
    minParticipants: 10,
    sortType: 'closed',
    allowCustomCategories: false,
    shuffleCards: true,
    showCardNumbers: false,
    allowUncategorized: false,
    requireAllCardsPlaced: true,
    maxCustomCategories: 10,
    minCardsPerCategory: 1,
    showBreadcrumbs: true,
    allowBacktracking: true,
    showSearchFunctionality: false,
    maxDepth: 5,
    timeLimit: 300,
    showProgress: true,
    allowPause: true,
    theme: 'default'
  });

  const [newCardText, setNewCardText] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTask, setNewTask] = useState('');
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const studyTypeOptions = [
    { value: 'card-sorting', label: 'Closed Card Sorting', description: 'Participants sort cards into predefined categories' },
    { value: 'open-card-sorting', label: 'Open Card Sorting', description: 'Participants create their own categories' },
    { value: 'tree-testing', label: 'Tree Testing', description: 'Test navigation and findability in site structure' },
    { value: 'reverse-card-sorting', label: 'Reverse Card Sorting', description: 'Participants evaluate existing groupings' },
  ];

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

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, newTask.trim()]);
      setNewTask('');
    }
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, value: string) => {
    setTasks(tasks.map((task, i) => i === index ? value : task));
  };

  const handleBulkImport = (data: BulkUploadData) => {
    if (data.cards) {
      setCards(prev => [...prev, ...data.cards!]);
    }
    if (data.categories) {
      setCategories(prev => [...prev, ...data.categories!]);
    }
    if (data.treeStructure) {
      setTreeStructure(data.treeStructure);
    }
    if (data.tasks) {
      setTasks(prev => [...prev, ...data.tasks!]);
    }
    setShowBulkUpload(false);
  };

  const handleSave = () => {
    if (!studyName.trim()) {
      alert('Please enter a study name');
      return;
    }

    // Validation based on study type
    if (studyType === 'tree-testing') {
      if (treeStructure.length === 0) {
        alert('Please add a tree structure for tree testing');
        return;
      }
      if (tasks.length === 0) {
        alert('Please add at least one task for tree testing');
        return;
      }
    } else {
      if (cards.length === 0) {
        alert('Please add at least one card');
        return;
      }
      
      if (studyType === 'card-sorting' || studyType === 'reverse-card-sorting') {
        if (categories.length === 0 || categories.some(cat => !cat.name.trim())) {
          alert('Please add at least one category with a name');
          return;
        }
      }
    }

    const newStudy: Study = {
      id: study?.id || Date.now(),
      name: studyName.trim(),
      description: studyDescription.trim(),
      type: studyType,
      cards,
      categories: categories.filter(cat => cat.name.trim()),
      treeStructure: studyType === 'tree-testing' ? treeStructure : undefined,
      tasks: studyType === 'tree-testing' ? tasks : undefined,
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

  const isCardSorting = ['card-sorting', 'open-card-sorting', 'reverse-card-sorting'].includes(studyType);
  const isTreeTesting = studyType === 'tree-testing';

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {study ? 'Edit Study' : 'Create New Study'}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Study Type *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {studyTypeOptions.map(option => (
                        <label key={option.value} className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                          studyType === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <input
                            type="radio"
                            value={option.value}
                            checked={studyType === option.value}
                            onChange={(e) => setStudyType(e.target.value as StudyType)}
                            className="sr-only"
                          />
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {option.value === 'tree-testing' ? (
                                <FolderTree className="w-5 h-5 text-blue-600" />
                              ) : option.value === 'reverse-card-sorting' ? (
                                <Shuffle className="w-5 h-5 text-orange-600" />
                              ) : (
                                <Target className="w-5 h-5 text-green-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{option.label}</div>
                              <div className="text-sm text-gray-600">{option.description}</div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bulk Upload */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Content</h3>
                  <button
                    onClick={() => setShowBulkUpload(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Bulk Upload</span>
                  </button>
                </div>
              </div>

              {/* Cards Section - for card sorting methods */}
              {isCardSorting && (
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
              )}

              {/* Categories Section - for closed and reverse card sorting */}
              {(studyType === 'card-sorting' || studyType === 'reverse-card-sorting' || settings.sortType === 'hybrid') && (
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
              )}

              {/* Tasks Section - for tree testing */}
              {isTreeTesting && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tasks ({tasks.length})</h3>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, addTask)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter task description (e.g., 'Find the contact information')"
                      />
                      <button
                        onClick={addTask}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Task</span>
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {tasks.map((task, index) => (
                        <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                          <input
                            type="text"
                            value={task}
                            onChange={(e) => updateTask(index, e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent mr-2"
                            placeholder="Task description"
                          />
                          <button
                            onClick={() => removeTask(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Section */}
              <div className="border-t pt-6">
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

                {/* Card Sorting Specific Settings */}
                {isCardSorting && (
                  <div className="mt-6 space-y-4">
                    <h4 className="font-medium text-gray-900">Card Sorting Options</h4>
                    
                    {studyType === 'open-card-sorting' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Custom Categories
                          </label>
                          <input
                            type="number"
                            value={settings.maxCustomCategories}
                            onChange={(e) => setSettings({...settings, maxCustomCategories: parseInt(e.target.value) || 10})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Min Cards Per Category
                          </label>
                          <input
                            type="number"
                            value={settings.minCardsPerCategory}
                            onChange={(e) => setSettings({...settings, minCardsPerCategory: parseInt(e.target.value) || 1})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="1"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
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
                          checked={settings.allowUncategorized}
                          onChange={(e) => setSettings({...settings, allowUncategorized: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Allow uncategorized cards</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Tree Testing Specific Settings */}
                {isTreeTesting && (
                  <div className="mt-6 space-y-4">
                    <h4 className="font-medium text-gray-900">Tree Testing Options</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time Limit (seconds)
                        </label>
                        <input
                          type="number"
                          value={settings.timeLimit}
                          onChange={(e) => setSettings({...settings, timeLimit: parseInt(e.target.value) || 300})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Depth Levels
                        </label>
                        <input
                          type="number"
                          value={settings.maxDepth}
                          onChange={(e) => setSettings({...settings, maxDepth: parseInt(e.target.value) || 5})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.showBreadcrumbs}
                          onChange={(e) => setSettings({...settings, showBreadcrumbs: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Show breadcrumb navigation</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.allowBacktracking}
                          onChange={(e) => setSettings({...settings, allowBacktracking: e.target.checked})}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Allow participants to go back</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* General Settings */}
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-gray-900">General Options</h4>
                  
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

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUpload
          studyType={studyType}
          onDataImported={handleBulkImport}
          onClose={() => setShowBulkUpload(false)}
        />
      )}
    </>
  );
};

export default EnhancedStudyCreator;