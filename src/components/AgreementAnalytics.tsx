/**
 * Agreement Analytics Component
 * Displays agreement scores and analytics with interactive visualizations
 * Implemented based on orchestrator routing: frontend-ux-specialist + analytics-specialist
 */

import React, { useState, useEffect, useMemo } from 'react';
import { StudyResult, Study } from '../types';
import {
  performAgreementAnalysis,
  generateAgreementHeatmapData,
  type StudyAgreementAnalysis,
  type HeatmapData
} from '../analytics/agreementScores';
import { BarChart, Activity, TrendingUp, Users, Layers, Eye, EyeOff } from 'lucide-react';

interface AgreementAnalyticsProps {
  results: StudyResult[];
  study: Study;
}

export const AgreementAnalytics: React.FC<AgreementAnalyticsProps> = ({ results }) => {
  const [analysis, setAnalysis] = useState<StudyAgreementAnalysis | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'cards' | 'categories' | 'heatmap'>('overview');
  const [sortBy, setSortBy] = useState<'agreement' | 'alphabetical'>('agreement');
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});

  // Memoized analysis calculation
  const analysisData = useMemo(() => {
    try {
      if (results.length === 0) return null;
      return performAgreementAnalysis(results);
    } catch (err) {
      console.error('Agreement analysis failed:', err);
      return null;
    }
  }, [results]);

  useEffect(() => {
    const calculateAnalysis = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!analysisData) {
          throw new Error('No card sorting results available for agreement analysis');
        }

        setAnalysis(analysisData);

        // Generate heatmap data
        const cardSortResults = results.filter(r =>
          ['card-sorting', 'open-card-sorting', 'reverse-card-sorting'].includes(r.studyType)
        );

        if (cardSortResults.length > 0) {
          const heatmap = generateAgreementHeatmapData(cardSortResults as any);
          setHeatmapData(heatmap);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to calculate agreement analysis');
        console.error('Agreement analysis error:', err);
      } finally {
        setLoading(false);
      }
    };

    calculateAnalysis();
  }, [analysisData, results]);

  const toggleDetails = (id: string) => {
    setShowDetails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatScore = (score: number) => `${score.toFixed(1)}%`;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="text-lg font-medium text-gray-700">Calculating agreement scores...</span>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2">
          <div className="text-red-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-800">Agreement Analysis Error</h3>
            <p className="text-red-600 mt-1">{error || 'Unable to calculate agreement scores'}</p>
          </div>
        </div>
      </div>
    );
  }

  const sortedCards = [...analysis.cardAgreements].sort((a, b) => {
    if (sortBy === 'agreement') return b.agreementScore - a.agreementScore;
    return a.cardText.localeCompare(b.cardText);
  });

  const sortedCategories = [...analysis.categoryAgreements].sort((a, b) => {
    if (sortBy === 'agreement') return b.agreementScore - a.agreementScore;
    return a.categoryName.localeCompare(b.categoryName);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart className="w-8 h-8 text-indigo-600 mr-3" />
              Agreement Analysis
            </h2>
            <p className="text-gray-600 mt-1">Statistical analysis of participant agreement on card placements</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-600">
              {formatScore(analysis.overallAgreementScore)}
            </div>
            <div className="text-sm text-gray-500">Overall Agreement</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'cards', label: 'Card Agreement', icon: Layers },
              { id: 'categories', label: 'Category Agreement', icon: Users },
              { id: 'heatmap', label: 'Agreement Matrix', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {formatScore(analysis.insights.averageAgreementScore)}
                  </div>
                  <div className="text-sm text-indigo-700">Average Agreement</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {analysis.cardAgreements.filter(c => c.agreementScore >= 80).length}
                  </div>
                  <div className="text-sm text-green-700">High Agreement Cards</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {analysis.categoryAgreements.length}
                  </div>
                  <div className="text-sm text-yellow-700">Unique Categories</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {results.length}
                  </div>
                  <div className="text-sm text-purple-700">Participants</div>
                </div>
              </div>

              {/* Agreement Distribution */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Agreement Score Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  {Object.entries(analysis.insights.agreementDistribution).map(([range, count]) => (
                    <div key={range} className="bg-gray-50 p-3 rounded text-center">
                      <div className="text-lg font-bold text-gray-900">{count}</div>
                      <div className="text-xs text-gray-600">{range}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top and Bottom Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Highest Agreement</h3>
                  {analysis.insights.highestAgreementCard && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="font-medium text-green-900">
                        {analysis.insights.highestAgreementCard.cardText}
                      </div>
                      <div className="text-green-700 text-sm mt-1">
                        {formatScore(analysis.insights.highestAgreementCard.agreementScore)} agreement
                        in "{analysis.insights.highestAgreementCard.consensusCategory}"
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Lowest Agreement</h3>
                  {analysis.insights.lowestAgreementCard && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="font-medium text-red-900">
                        {analysis.insights.lowestAgreementCard.cardText}
                      </div>
                      <div className="text-red-700 text-sm mt-1">
                        {formatScore(analysis.insights.lowestAgreementCard.agreementScore)} agreement
                        across {analysis.insights.lowestAgreementCard.uniquePlacements} categories
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cards Tab */}
          {activeTab === 'cards' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Card Agreement Scores</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'agreement' | 'alphabetical')}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="agreement">Sort by Agreement</option>
                  <option value="alphabetical">Sort Alphabetically</option>
                </select>
              </div>

              <div className="space-y-2">
                {sortedCards.map((card) => (
                  <div key={card.cardId} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(card.agreementScore)}`}>
                          {getScoreBadge(card.agreementScore)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{card.cardText}</div>
                          <div className="text-sm text-gray-600">
                            {formatScore(card.agreementScore)} agreement in "{card.consensusCategory}"
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-bold text-lg">{formatScore(card.agreementScore)}</div>
                          <div className="text-xs text-gray-500">{card.uniquePlacements} categories used</div>
                        </div>
                        <button
                          onClick={() => toggleDetails(card.cardId)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showDetails[card.cardId] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {showDetails[card.cardId] && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">Placement Distribution</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(card.placementFrequency)
                            .sort(([,a], [,b]) => b - a)
                            .map(([category, count]) => (
                            <div key={category} className="flex justify-between items-center py-1">
                              <span className="text-sm text-gray-700">{category}</span>
                              <span className="text-sm font-medium">
                                {count} ({Math.round((count / card.totalParticipants) * 100)}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Category Agreement Scores</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'agreement' | 'alphabetical')}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="agreement">Sort by Agreement</option>
                  <option value="alphabetical">Sort Alphabetically</option>
                </select>
              </div>

              <div className="space-y-2">
                {sortedCategories.map((category) => (
                  <div key={category.categoryName} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(category.agreementScore)}`}>
                          {getScoreBadge(category.agreementScore)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{category.categoryName}</div>
                          <div className="text-sm text-gray-600">
                            Used by {category.usageFrequency} participants ({formatScore(category.usagePercentage)})
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-bold text-lg">{formatScore(category.agreementScore)}</div>
                          <div className="text-xs text-gray-500">{category.cardCount} cards</div>
                        </div>
                        <button
                          onClick={() => toggleDetails(category.categoryName)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showDetails[category.categoryName] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {showDetails[category.categoryName] && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Consensus Cards</h4>
                            <div className="space-y-1">
                              {category.consensusCards.length > 0 ? (
                                category.consensusCards.map(cardId => (
                                  <div key={cardId} className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded">
                                    {sortedCards.find(c => c.cardId === cardId)?.cardText || cardId}
                                  </div>
                                ))
                              ) : (
                                <div className="text-sm text-gray-500">No consensus cards</div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">All Cards in Category</h4>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {category.cardsInCategory.map(cardId => (
                                <div key={cardId} className="text-sm text-gray-600">
                                  {sortedCards.find(c => c.cardId === cardId)?.cardText || cardId}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Heatmap Tab */}
          {activeTab === 'heatmap' && heatmapData && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Card Agreement Matrix</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-4">
                  This matrix shows the percentage of participants who placed each pair of cards in the same category.
                  Higher percentages (darker colors) indicate stronger agreement between cards.
                </p>

                {/* Note: In a full implementation, this would be a D3.js heatmap */}
                <div className="text-sm text-gray-600">
                  Matrix data available with {heatmapData.cardPairs.length} card pairs.
                  Score range: {heatmapData.minScore.toFixed(1)}% - {heatmapData.maxScore.toFixed(1)}%
                </div>

                {/* Placeholder for heatmap visualization */}
                <div className="mt-4 h-64 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <div className="text-gray-500">Interactive heatmap visualization</div>
                    <div className="text-sm text-gray-400">D3.js implementation needed</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};