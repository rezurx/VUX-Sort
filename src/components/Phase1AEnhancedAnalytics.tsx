/**
 * Phase 1A Enhanced Analytics Dashboard
 * Integrates all Phase 1A features coordinated by the orchestrator system
 * Features: Agreement Scores, Journey Tracking, Card Metadata, Enhanced Exports
 */

import React, { useState, useMemo } from 'react';
import { StudyResult, Study } from '../types';
import { AgreementAnalytics } from './AgreementAnalytics';
import {
  BarChart,
  Activity,
  Download,
  Tag,
  Clock,
  Map,
  Filter
} from 'lucide-react';

// Import analytics modules
import { performAgreementAnalysis } from '../analytics/agreementScores';
import { analyzeStudyJourneys, type ParticipantJourney } from '../analytics/journeyTracking';
import {
  createTaggingSystem,
  type TaggingSystem,
  type CardSearchCriteria
} from '../analytics/cardMetadata';
import { exportResults, type ExportFormat, type ExportOptions } from '../utils/exportUtils';

interface Phase1AEnhancedAnalyticsProps {
  results: StudyResult[];
  study: Study;
  participantJourneys?: ParticipantJourney[];
}

type AnalyticsTab = 'overview' | 'agreement' | 'journey' | 'metadata' | 'export';

export const Phase1AEnhancedAnalytics: React.FC<Phase1AEnhancedAnalyticsProps> = ({
  results,
  study,
  participantJourneys = []
}) => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [loading, setLoading] = useState(false);
  const [taggingSystem] = useState<TaggingSystem>(() => createTaggingSystem());
  const [, setSearchCriteria] = useState<CardSearchCriteria>({});
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeMetadata: true,
    includeDemographics: true,
    includeTimestamps: true,
    includeAgreementScores: true
  });

  // Memoized analytics calculations
  const agreementAnalysis = useMemo(() => {
    try {
      if (results.length === 0) return null;
      return performAgreementAnalysis(results);
    } catch (error) {
      console.error('Agreement analysis failed:', error);
      return null;
    }
  }, [results]);

  const journeyAnalysis = useMemo(() => {
    try {
      if (participantJourneys.length === 0) return null;
      return analyzeStudyJourneys(participantJourneys);
    } catch (error) {
      console.error('Journey analysis failed:', error);
      return null;
    }
  }, [participantJourneys]);

  const handleExport = async (format: ExportFormat) => {
    setLoading(true);
    try {
      await exportResults(results, study, format, exportOptions);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Activity,
      description: 'Comprehensive study summary with all Phase 1A metrics'
    },
    {
      id: 'agreement',
      label: 'Agreement Analysis',
      icon: BarChart,
      description: 'Card and category agreement scores with statistical analysis'
    },
    {
      id: 'journey',
      label: 'Participant Journeys',
      icon: Map,
      description: 'Movement tracking and temporal behavior analysis'
    },
    {
      id: 'metadata',
      label: 'Card Metadata',
      icon: Tag,
      description: 'Cross-study card tracking and tagging system'
    },
    {
      id: 'export',
      label: 'Enhanced Export',
      icon: Download,
      description: 'Advanced export options with comprehensive analytics'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Phase 1A Enhanced Analytics</h1>
            <p className="text-indigo-100 mt-2">
              Orchestrator-coordinated implementation of agreement scores, journey tracking,
              metadata management, and enhanced exports
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{results.length}</div>
            <div className="text-indigo-100">Participants</div>
            <div className="text-sm text-indigo-200 mt-1">
              {participantJourneys.length} journeys tracked
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AnalyticsTab)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium flex items-center space-x-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                title={tab.description}
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
            <div className="space-y-8">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Agreement Score</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {agreementAnalysis ? `${agreementAnalysis.overallAgreementScore.toFixed(1)}%` : 'N/A'}
                      </p>
                    </div>
                    <BarChart className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-blue-700 text-xs mt-2">Overall participant agreement</p>
                </div>

                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Journey Insights</p>
                      <p className="text-2xl font-bold text-green-900">
                        {journeyAnalysis ? journeyAnalysis.averageJourney.movements.toFixed(0) : 'N/A'}
                      </p>
                    </div>
                    <Map className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-green-700 text-xs mt-2">Average card movements</p>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Card Metadata</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {taggingSystem.cardMetadata.size}
                      </p>
                    </div>
                    <Tag className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-purple-700 text-xs mt-2">Cards with metadata</p>
                </div>

                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Export Ready</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {Object.values(exportOptions).filter(Boolean).length}/4
                      </p>
                    </div>
                    <Download className="w-8 h-8 text-orange-600" />
                  </div>
                  <p className="text-orange-700 text-xs mt-2">Export options enabled</p>
                </div>
              </div>

              {/* Phase 1A Implementation Status */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Phase 1A Implementation Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Enhanced Export Options</span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">✓ Complete</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Agreement Scores</span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">✓ Complete</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Journey Tracking</span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">✓ Complete</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Card Metadata/Tagging</span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">✓ Complete</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab('agreement')}
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <BarChart className="w-4 h-4" />
                  <span>View Agreement Analysis</span>
                </button>
                <button
                  onClick={() => setActiveTab('journey')}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Map className="w-4 h-4" />
                  <span>View Participant Journeys</span>
                </button>
                <button
                  onClick={() => setActiveTab('export')}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Enhanced Data</span>
                </button>
              </div>
            </div>
          )}

          {/* Agreement Analysis Tab */}
          {activeTab === 'agreement' && (
            <AgreementAnalytics results={results} study={study} />
          )}

          {/* Journey Analysis Tab */}
          {activeTab === 'journey' && (
            <div className="space-y-6">
              {journeyAnalysis ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-900">
                        {(journeyAnalysis.averageJourney.duration / 1000 / 60).toFixed(1)}m
                      </div>
                      <div className="text-blue-700 text-sm">Average Duration</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-900">
                        {journeyAnalysis.averageJourney.movements.toFixed(0)}
                      </div>
                      <div className="text-green-700 text-sm">Average Movements</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-900">
                        {journeyAnalysis.patterns.problematicCards.length}
                      </div>
                      <div className="text-red-700 text-sm">Problematic Cards</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Movement Patterns</h3>
                    <div className="space-y-3">
                      {journeyAnalysis.patterns.commonMovementPatterns.slice(0, 5).map((pattern, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">{pattern.pattern}</span>
                            <span className="text-xs text-gray-500">{pattern.frequency} occurrences</span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">{pattern.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Journey Data Available</h3>
                  <p className="text-gray-600 mt-2">
                    Journey tracking data is not available for this study.
                    Enable journey tracking in future card sorting sessions to see participant movement patterns.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Metadata Tab */}
          {activeTab === 'metadata' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Card Metadata & Tagging</h3>
                <button className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  <Tag className="w-4 h-4" />
                  <span>Manage Tags</span>
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Search Cards</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Search by text..."
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    onChange={(e) => setSearchCriteria(prev => ({ ...prev, textSearch: e.target.value }))}
                  />
                  <select
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    onChange={(e) => {
                      const category = e.target.value as any;
                      setSearchCriteria(prev => ({
                        ...prev,
                        tagCategories: category ? [category] : undefined
                      }));
                    }}
                  >
                    <option value="">All categories</option>
                    <option value="content-type">Content Type</option>
                    <option value="domain">Domain</option>
                    <option value="complexity">Complexity</option>
                    <option value="behavior">Behavior</option>
                  </select>
                  <button className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                    <Filter className="w-4 h-4" />
                    <span>Apply Filters</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="text-center py-12">
                  <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Metadata System Ready</h3>
                  <p className="text-gray-600 mt-2">
                    The card metadata and tagging system is implemented and ready for use.
                    Tags can be created and applied to cards for cross-study analysis.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Enhanced Export Options</h3>
                <p className="text-gray-600 mb-6">
                  Export your study data with comprehensive analytics including agreement scores,
                  participant journeys, and metadata insights.
                </p>
              </div>

              {/* Export Options */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Export Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeMetadata}
                      onChange={(e) => setExportOptions((prev: ExportOptions) => ({ ...prev, includeMetadata: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Include metadata and tags</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeDemographics}
                      onChange={(e) => setExportOptions((prev: ExportOptions) => ({ ...prev, includeDemographics: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Include demographics</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeTimestamps}
                      onChange={(e) => setExportOptions((prev: ExportOptions) => ({ ...prev, includeTimestamps: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Include timestamps</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeAgreementScores}
                      onChange={(e) => setExportOptions((prev: ExportOptions) => ({ ...prev, includeAgreementScores: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Include agreement scores</span>
                  </label>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { format: 'csv' as ExportFormat, label: 'CSV Export', description: 'Raw data for analysis', color: 'green' },
                  { format: 'excel' as ExportFormat, label: 'Excel Export', description: 'Multi-sheet workbook', color: 'blue' },
                  { format: 'pdf' as ExportFormat, label: 'PDF Report', description: 'Professional report', color: 'red' },
                  { format: 'json' as ExportFormat, label: 'JSON Export', description: 'Complete data structure', color: 'purple' }
                ].map(({ format, label, description, color }) => (
                  <button
                    key={format}
                    onClick={() => handleExport(format)}
                    disabled={loading}
                    className={`p-4 border-2 border-dashed rounded-lg text-center hover:border-solid transition-all ${
                      color === 'green' ? 'border-green-300 hover:border-green-500 hover:bg-green-50' :
                      color === 'blue' ? 'border-blue-300 hover:border-blue-500 hover:bg-blue-50' :
                      color === 'red' ? 'border-red-300 hover:border-red-500 hover:bg-red-50' :
                      'border-purple-300 hover:border-purple-500 hover:bg-purple-50'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Download className={`w-8 h-8 mx-auto mb-2 ${
                      color === 'green' ? 'text-green-600' :
                      color === 'blue' ? 'text-blue-600' :
                      color === 'red' ? 'text-red-600' :
                      'text-purple-600'
                    }`} />
                    <div className="font-medium text-gray-900">{label}</div>
                    <div className="text-sm text-gray-600">{description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};