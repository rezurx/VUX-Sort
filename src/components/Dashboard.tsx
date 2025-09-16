import React from 'react';
import { Plus, Users, BarChart3, Play, Edit, Trash2, Copy, Mail } from 'lucide-react';
import { Study, CardSortResult } from '../types';
import { formatDuration } from '../utils';

interface DashboardProps {
  studies: Study[];
  results: Record<string, CardSortResult[]>;
  onCreateStudy: () => void;
  onEditStudy: (study: Study) => void;
  onDeleteStudy: (studyId: number) => void;
  onViewAnalytics: (study: Study) => void;
  onStartParticipant: (study: Study) => void;
  onDuplicateStudy: (study: Study) => void;
  onManageParticipants: (study: Study) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  studies,
  results,
  onCreateStudy,
  onEditStudy,
  onDeleteStudy,
  onViewAnalytics,
  onStartParticipant,
  onDuplicateStudy,
  onManageParticipants
}) => {
  const getStudyResults = (studyId: number): CardSortResult[] => {
    return Object.values(results).flat().filter(result => result.studyId === studyId);
  };

  const getAverageDuration = (studyResults: CardSortResult[]): string => {
    if (studyResults.length === 0) return 'No data';
    const avgDuration = studyResults.reduce((sum, result) => sum + result.totalDuration, 0) / studyResults.length;
    return formatDuration(avgDuration);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">VUX Sort Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your card sorting studies</p>
            </div>
            <button
              onClick={onCreateStudy}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Study</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {studies.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No studies yet</h3>
              <p className="text-gray-600 mb-6">Create your first card sorting study to get started</p>
              <button
                onClick={onCreateStudy}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Study</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studies.map(study => {
              const studyResults = getStudyResults(study.id);
              const participantCount = studyResults.length;
              const averageDuration = getAverageDuration(studyResults);
              
              return (
                <div key={study.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{study.name}</h3>
                        {study.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{study.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Cards:</span>
                        <span className="font-medium">{study.cards.length}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Categories:</span>
                        <span className="font-medium">{study.categories.length}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          Participants:
                        </span>
                        <span className="font-medium">{participantCount}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Avg. Duration:</span>
                        <span className="font-medium">{averageDuration}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">{new Date(study.created).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onStartParticipant(study)}
                          className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center space-x-1"
                          title="Start participant session"
                        >
                          <Play className="w-3 h-3" />
                          <span>Start</span>
                        </button>
                        
                        <button
                          onClick={() => onViewAnalytics(study)}
                          className="bg-purple-600 text-white px-3 py-1.5 rounded text-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center space-x-1"
                          title="View analytics"
                        >
                          <BarChart3 className="w-3 h-3" />
                          <span>Analytics</span>
                        </button>
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => onDuplicateStudy(study)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50"
                          title="Duplicate study"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => onManageParticipants(study)}
                          className="text-purple-600 hover:text-purple-800 p-1.5 rounded hover:bg-purple-50"
                          title="Manage participants"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => onEditStudy(study)}
                          className="text-gray-600 hover:text-gray-800 p-1.5 rounded hover:bg-gray-50"
                          title="Edit study"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this study? This action cannot be undone.')) {
                              onDeleteStudy(study.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50"
                          title="Delete study"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;