import React, { useState } from 'react';
import { Download, Upload, BookOpen, Globe, Smartphone, ShoppingCart, Building, Users, Zap, Star, Copy, X } from 'lucide-react';
import { StudyType, Card, Category, StudySettings } from '../types';

interface StudyTemplatesProps {
  onTemplateSelect: (template: StudyTemplate) => void;
  onClose: () => void;
}

export interface StudyTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  studyType: StudyType;
  icon: React.ReactNode;
  cards: Card[];
  categories: Category[];
  settings: Partial<StudySettings>;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  participantCount: string;
}

export type TemplateCategory = 'e-commerce' | 'corporate' | 'education' | 'healthcare' | 'media' | 'technology' | 'general';

const StudyTemplates: React.FC<StudyTemplatesProps> = ({ onTemplateSelect, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Predefined study templates for common IA scenarios
  const studyTemplates: StudyTemplate[] = [
    {
      id: 'ecommerce-navigation',
      name: 'E-commerce Website Navigation',
      description: 'Test navigation structure for an online store with product categories, user account features, and support sections.',
      category: 'e-commerce',
      studyType: 'tree-testing',
      icon: <ShoppingCart className="w-6 h-6" />,
      cards: [],
      categories: [],
      settings: {
        maxParticipants: 30,
        minParticipants: 15,
        showBreadcrumbs: true,
        allowBacktracking: true,
        timeLimit: 600
      },
      tags: ['navigation', 'e-commerce', 'tree-testing'],
      difficulty: 'intermediate',
      estimatedTime: 45,
      participantCount: '15-30'
    },
    {
      id: 'content-organization',
      name: 'Content Organization for News Site',
      description: 'Organize news articles and content types to understand user mental models for media consumption.',
      category: 'media',
      studyType: 'open-card-sorting',
      icon: <BookOpen className="w-6 h-6" />,
      cards: [
        { id: 1, text: 'Breaking News' },
        { id: 2, text: 'Sports Results' },
        { id: 3, text: 'Weather Forecast' },
        { id: 4, text: 'Opinion Pieces' },
        { id: 5, text: 'Local News' },
        { id: 6, text: 'International News' },
        { id: 7, text: 'Business Updates' },
        { id: 8, text: 'Technology Reviews' },
        { id: 9, text: 'Entertainment News' },
        { id: 10, text: 'Health & Wellness' },
        { id: 11, text: 'Food & Recipes' },
        { id: 12, text: 'Travel Guides' },
        { id: 13, text: 'Photo Galleries' },
        { id: 14, text: 'Video Content' },
        { id: 15, text: 'Podcasts' },
        { id: 16, text: 'Live Streams' },
        { id: 17, text: 'User Comments' },
        { id: 18, text: 'Social Media Posts' },
        { id: 19, text: 'Newsletter Signup' },
        { id: 20, text: 'Advertisement' }
      ],
      categories: [],
      settings: {
        sortType: 'open',
        allowCustomCategories: true,
        maxCustomCategories: 8,
        minCardsPerCategory: 2
      },
      tags: ['content', 'media', 'open-sorting'],
      difficulty: 'beginner',
      estimatedTime: 30,
      participantCount: '10-25'
    },
    {
      id: 'mobile-app-features',
      name: 'Mobile Banking App Features',
      description: 'Validate the organization of banking features and services in a mobile application interface.',
      category: 'technology',
      studyType: 'hybrid-card-sorting',
      icon: <Smartphone className="w-6 h-6" />,
      cards: [
        { id: 1, text: 'Check Balance' },
        { id: 2, text: 'Transfer Money' },
        { id: 3, text: 'Pay Bills' },
        { id: 4, text: 'Deposit Checks' },
        { id: 5, text: 'ATM Locator' },
        { id: 6, text: 'Account Settings' },
        { id: 7, text: 'Transaction History' },
        { id: 8, text: 'Budgeting Tools' },
        { id: 9, text: 'Investment Portfolio' },
        { id: 10, text: 'Loan Information' },
        { id: 11, text: 'Credit Score' },
        { id: 12, text: 'Notifications' },
        { id: 13, text: 'Customer Support' },
        { id: 14, text: 'Security Settings' },
        { id: 15, text: 'Card Management' },
        { id: 16, text: 'Rewards Program' },
        { id: 17, text: 'Financial Planning' },
        { id: 18, text: 'Insurance Options' },
        { id: 19, text: 'Currency Exchange' },
        { id: 20, text: 'Educational Resources' }
      ],
      categories: [
        { id: 1, name: 'Account Management', cards: [] },
        { id: 2, name: 'Transactions', cards: [] },
        { id: 3, name: 'Tools & Services', cards: [] },
        { id: 4, name: 'Support & Security', cards: [] }
      ],
      settings: {
        sortType: 'hybrid',
        allowCustomCategories: true,
        maxCustomCategories: 6,
        requireAllCardsPlaced: true
      },
      tags: ['mobile', 'banking', 'hybrid-sorting'],
      difficulty: 'advanced',
      estimatedTime: 60,
      participantCount: '20-40'
    },
    {
      id: 'healthcare-portal',
      name: 'Patient Healthcare Portal',
      description: 'Organize patient-facing features and medical information in a healthcare portal interface.',
      category: 'healthcare',
      studyType: 'sequential-card-sorting',
      icon: <Users className="w-6 h-6" />,
      cards: [
        { id: 1, text: 'Appointment Scheduling' },
        { id: 2, text: 'Medical Records' },
        { id: 3, text: 'Prescription Refills' },
        { id: 4, text: 'Test Results' },
        { id: 5, text: 'Provider Messages' },
        { id: 6, text: 'Insurance Information' },
        { id: 7, text: 'Billing & Payments' },
        { id: 8, text: 'Health Tracking' },
        { id: 9, text: 'Symptom Checker' },
        { id: 10, text: 'Emergency Contacts' },
        { id: 11, text: 'Telehealth Visits' },
        { id: 12, text: 'Vaccine Records' },
        { id: 13, text: 'Specialist Referrals' },
        { id: 14, text: 'Health Education' },
        { id: 15, text: 'Family Health History' },
        { id: 16, text: 'Medication Lists' },
        { id: 17, text: 'Care Team Info' },
        { id: 18, text: 'Privacy Settings' },
        { id: 19, text: 'Download Records' },
        { id: 20, text: 'Health Goals' }
      ],
      categories: [
        { id: 1, name: 'Medical Care', cards: [] },
        { id: 2, name: 'Health Management', cards: [] },
        { id: 3, name: 'Administrative', cards: [] }
      ],
      settings: {
        sortType: 'closed',
        requireAllCardsPlaced: true,
        minCardsPerCategory: 3,
        collectDemographics: true
      },
      tags: ['healthcare', 'portal', 'sequential'],
      difficulty: 'intermediate',
      estimatedTime: 50,
      participantCount: '15-30'
    },
    {
      id: 'corporate-intranet',
      name: 'Corporate Intranet Navigation',
      description: 'Test the organization of internal company resources and tools for employee productivity.',
      category: 'corporate',
      studyType: 'tree-testing',
      icon: <Building className="w-6 h-6" />,
      cards: [],
      categories: [],
      settings: {
        maxParticipants: 50,
        showBreadcrumbs: true,
        allowBacktracking: true,
        maxDepth: 4,
        timeLimit: 480
      },
      tags: ['intranet', 'corporate', 'tree-testing'],
      difficulty: 'advanced',
      estimatedTime: 40,
      participantCount: '25-50'
    },
    {
      id: 'learning-platform',
      name: 'Online Learning Platform',
      description: 'Organize educational content and platform features to optimize student experience.',
      category: 'education',
      studyType: 'open-card-sorting',
      icon: <Globe className="w-6 h-6" />,
      cards: [
        { id: 1, text: 'Course Catalog' },
        { id: 2, text: 'My Courses' },
        { id: 3, text: 'Assignments' },
        { id: 4, text: 'Grades' },
        { id: 5, text: 'Discussion Forums' },
        { id: 6, text: 'Live Sessions' },
        { id: 7, text: 'Study Groups' },
        { id: 8, text: 'Calendar' },
        { id: 9, text: 'Notifications' },
        { id: 10, text: 'Resource Library' },
        { id: 11, text: 'Certificates' },
        { id: 12, text: 'Progress Tracking' },
        { id: 13, text: 'Instructor Profiles' },
        { id: 14, text: 'Technical Support' },
        { id: 15, text: 'Account Settings' },
        { id: 16, text: 'Payment History' },
        { id: 17, text: 'Downloadable Content' },
        { id: 18, text: 'Peer Reviews' },
        { id: 19, text: 'Practice Exams' },
        { id: 20, text: 'Career Services' }
      ],
      categories: [],
      settings: {
        sortType: 'open',
        allowCustomCategories: true,
        maxCustomCategories: 10,
        shuffleCards: true
      },
      tags: ['education', 'learning', 'open-sorting'],
      difficulty: 'beginner',
      estimatedTime: 35,
      participantCount: '12-25'
    }
  ];

  const templateCategories: { value: TemplateCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All Templates', icon: <Star className="w-4 h-4" /> },
    { value: 'e-commerce', label: 'E-commerce', icon: <ShoppingCart className="w-4 h-4" /> },
    { value: 'corporate', label: 'Corporate', icon: <Building className="w-4 h-4" /> },
    { value: 'education', label: 'Education', icon: <BookOpen className="w-4 h-4" /> },
    { value: 'healthcare', label: 'Healthcare', icon: <Users className="w-4 h-4" /> },
    { value: 'media', label: 'Media', icon: <Globe className="w-4 h-4" /> },
    { value: 'technology', label: 'Technology', icon: <Zap className="w-4 h-4" /> }
  ];

  const filteredTemplates = studyTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = searchTerm === '' ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStudyTypeLabel = (type: StudyType) => {
    switch (type) {
      case 'card-sorting': return 'Closed Card Sorting';
      case 'open-card-sorting': return 'Open Card Sorting';
      case 'hybrid-card-sorting': return 'Hybrid Card Sorting';
      case 'sequential-card-sorting': return 'Sequential Card Sorting';
      case 'tree-testing': return 'Tree Testing';
      case 'reverse-card-sorting': return 'Reverse Card Sorting';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Study Templates</h2>
              <p className="text-blue-100 mt-1">Start with proven study configurations for common IA research scenarios</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {templateCategories.map(category => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.icon}
                  {category.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64"
              />
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No templates found</h3>
              <p className="text-gray-500">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="p-6">
                    {/* Template icon and difficulty */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                          {template.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {template.name}
                          </h3>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getDifficultyColor(template.difficulty)}`}>
                            {template.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {template.description}
                    </p>

                    {/* Study type and stats */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Type:</span>
                        <span className="font-medium text-gray-900">{getStudyTypeLabel(template.studyType)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Time:</span>
                        <span className="font-medium text-gray-900">{template.estimatedTime} min</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Participants:</span>
                        <span className="font-medium text-gray-900">{template.participantCount}</span>
                      </div>
                      {template.cards.length > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Cards:</span>
                          <span className="font-medium text-gray-900">{template.cards.length}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{template.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Use template button */}
                    <button
                      onClick={() => onTemplateSelect(template)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Use This Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{filteredTemplates.length} templates available</span>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                <Upload className="w-4 h-4" />
                Import Template
              </button>
              <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                <Download className="w-4 h-4" />
                Export Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyTemplates;