import React, { useState } from 'react';
import { Download, ArrowLeft, Users, Clock, Target, TreePine } from 'lucide-react';
import { Study, StudyResult, CardSortResult, TreeTestResult } from '../types';
import SimilarityMatrix from './SimilarityMatrix';
import Dendrogram from './Dendrogram';
import { CategoryAnalysis } from '../analytics';
import { exportResults, formatDuration } from '../utils';

interface EnhancedAnalyticsProps {
  study: Study;
  results: StudyResult[];
  onBack: () => void;
}

const EnhancedAnalytics: React.FC<EnhancedAnalyticsProps> = ({ study, results, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'similarity' | 'dendrogram' | 'categories' | 'tree-analytics'>('overview');

  // Filter results by type
  const cardSortResults = results.filter(r => 
    ['card-sorting', 'open-card-sorting', 'reverse-card-sorting'].includes(r.studyType)
  ) as CardSortResult[];
  
  const treeTestResults = results.filter(r => r.studyType === 'tree-testing') as TreeTestResult[];

  const categoryFrequencies = cardSortResults.length > 0 ? CategoryAnalysis.calculateCategoryFrequency(cardSortResults) : [];
  
  const averageDuration = results.length > 0 
    ? results.reduce((sum, result) => sum + result.totalDuration, 0) / results.length 
    : 0;

  const completionRate = results.length > 0 ? 100 : 0;

  // Tree testing analytics
  const treeAnalytics = treeTestResults.length > 0 ? {
    taskSuccessRate: treeTestResults.reduce((sum, result) => 
      sum + result.treeTestResults.reduce((taskSum, task) => taskSum + (task.success ? 1 : 0), 0)
    , 0) / treeTestResults.reduce((sum, result) => sum + result.treeTestResults.length, 0) * 100,
    
    averageClicks: treeTestResults.reduce((sum, result) => 
      sum + result.treeTestResults.reduce((taskSum, task) => taskSum + task.clicks, 0)
    , 0) / treeTestResults.reduce((sum, result) => sum + result.treeTestResults.length, 0),
    
    directSuccessRate: treeTestResults.reduce((sum, result) => 
      sum + result.treeTestResults.reduce((taskSum, task) => taskSum + (task.directSuccess ? 1 : 0), 0)
    , 0) / treeTestResults.reduce((sum, result) => sum + result.treeTestResults.length, 0) * 100
  } : null;

  const handleExport = (format: 'csv' | 'json') => {
    exportResults(results, study, format);
  };

  const getStudyTypeLabel = (type: string) => {
    switch (type) {
      case 'card-sorting': return 'Closed Card Sorting';
      case 'open-card-sorting': return 'Open Card Sorting';
      case 'reverse-card-sorting': return 'Reverse Card Sorting';
      case 'tree-testing': return 'Tree Testing';
      default: return 'Study';
    }
  };

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Back to dashboard"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{study.name} - Analytics</h1>
                  <p className="text-sm text-gray-600">{getStudyTypeLabel(study.type)} Results</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-sm border p-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
              <p className="text-gray-600">
                This study hasn't collected any participant data yet. Share the participant link to start collecting results.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{study.name} - Analytics</h1>
                <p className="text-sm text-gray-600">{getStudyTypeLabel(study.type)} Results</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleExport('csv')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => handleExport('json')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Participants</p>
                <p className="text-2xl font-semibold text-gray-900">{results.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg. Duration</p>
                <p className="text-2xl font-semibold text-gray-900">{formatDuration(averageDuration)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {treeAnalytics && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TreePine className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Task Success</p>
                  <p className="text-2xl font-semibold text-gray-900">{treeAnalytics.taskSuccessRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>

            {cardSortResults.length > 0 && (
              <>
                <button
                  onClick={() => setActiveTab('similarity')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'similarity'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Card Similarity
                </button>
                
                <button
                  onClick={() => setActiveTab('dendrogram')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'dendrogram'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Dendrogram
                </button>

                <button
                  onClick={() => setActiveTab('categories')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'categories'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Category Analysis
                </button>
              </>
            )}

            {treeTestResults.length > 0 && (
              <button
                onClick={() => setActiveTab('tree-analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tree-analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tree Analytics
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Study Details</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Study Type:</dt>
                      <dd className="font-medium">{getStudyTypeLabel(study.type)}</dd>
                    </div>
                    {study.cards && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Total Cards:</dt>
                        <dd className="font-medium">{study.cards.length}</dd>
                      </div>
                    )}
                    {study.categories && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Categories:</dt>
                        <dd className="font-medium">{study.categories.length}</dd>
                      </div>
                    )}
                    {study.tasks && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Tasks:</dt>
                        <dd className="font-medium">{study.tasks.length}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Created:</dt>
                      <dd className="font-medium">{new Date(study.created).toLocaleDateString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Last Updated:</dt>
                      <dd className="font-medium">{new Date(study.updated).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Participation Stats</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Participants:</dt>
                      <dd className="font-medium">{results.length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Min Duration:</dt>
                      <dd className="font-medium">
                        {results.length > 0 ? formatDuration(Math.min(...results.map(r => r.totalDuration))) : 'N/A'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Max Duration:</dt>
                      <dd className="font-medium">
                        {results.length > 0 ? formatDuration(Math.max(...results.map(r => r.totalDuration))) : 'N/A'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Completion Rate:</dt>
                      <dd className="font-medium">{completionRate.toFixed(1)}%</dd>
                    </div>
                    {treeAnalytics && (
                      <>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Task Success Rate:</dt>
                          <dd className="font-medium">{treeAnalytics.taskSuccessRate.toFixed(1)}%</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Avg. Clicks per Task:</dt>
                          <dd className="font-medium">{treeAnalytics.averageClicks.toFixed(1)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Direct Success Rate:</dt>
                          <dd className="font-medium">{treeAnalytics.directSuccessRate.toFixed(1)}%</dd>
                        </div>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'similarity' && cardSortResults.length > 0 && (
          <div className="space-y-8">
            <SimilarityMatrix results={cardSortResults} />
          </div>
        )}

        {activeTab === 'dendrogram' && cardSortResults.length > 0 && (
          <div className="space-y-8">
            <Dendrogram results={cardSortResults} />
          </div>
        )}

        {activeTab === 'categories' && cardSortResults.length > 0 && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Usage Frequency</h3>
              <div className="space-y-4">
                {categoryFrequencies.map(category => (
                  <div key={category.categoryId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{category.categoryName}</h4>
                      <div className="text-sm text-gray-600">
                        {category.usage} / {cardSortResults.length} participants ({category.percentage.toFixed(1)}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {category.cards.map(card => (
                        <div key={card.id} className="text-xs bg-gray-50 px-2 py-1 rounded flex justify-between">
                          <span className="truncate">{card.text}</span>
                          <span className="font-medium text-gray-600 ml-1">{card.frequency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tree-analytics' && treeTestResults.length > 0 && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Tree Testing Results</h3>
              
              {treeAnalytics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-900">{treeAnalytics.taskSuccessRate.toFixed(1)}%</div>
                    <div className="text-sm text-green-700">Overall Success Rate</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-900">{treeAnalytics.averageClicks.toFixed(1)}</div>
                    <div className="text-sm text-blue-700">Average Clicks per Task</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-900">{treeAnalytics.directSuccessRate.toFixed(1)}%</div>
                    <div className="text-sm text-purple-700">Direct Success Rate</div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {study.tasks?.map((task, taskIndex) => {
                  const taskResults = treeTestResults.flatMap(result => 
                    result.treeTestResults.filter(tr => tr.taskId === taskIndex)
                  );
                  
                  if (taskResults.length === 0) return null;
                  
                  const successCount = taskResults.filter(tr => tr.success).length;
                  const directSuccessCount = taskResults.filter(tr => tr.directSuccess).length;
                  const avgClicks = taskResults.reduce((sum, tr) => sum + tr.clicks, 0) / taskResults.length;
                  const avgDuration = taskResults.reduce((sum, tr) => sum + tr.duration, 0) / taskResults.length;
                  
                  return (
                    <div key={taskIndex} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Task {taskIndex + 1}: {task}</h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {((successCount / taskResults.length) * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-600">Success Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">
                            {((directSuccessCount / taskResults.length) * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-600">Direct Success</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-purple-600">
                            {avgClicks.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-600">Avg. Clicks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-orange-600">
                            {formatDuration(avgDuration)}
                          </div>
                          <div className="text-xs text-gray-600">Avg. Time</div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(successCount / taskResults.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedAnalytics;