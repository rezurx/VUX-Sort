import React, { useState } from 'react';
import { Download, X, FileText, Table, FileSpreadsheet, File, CheckCircle, AlertCircle } from 'lucide-react';
import { StudyResult, Study } from '../types';
import { exportResults, ExportFormat } from '../utils/exportUtils';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  study: Study;
  results: StudyResult[];
}

const ExportDialog: React.FC<ExportDialogProps> = ({ isOpen, onClose, study, results }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [exportOptions, setExportOptions] = useState({
    includeMetadata: true,
    includeDemographics: true,
    includeTimestamps: true,
    includeAgreementScores: false
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const formatOptions: Array<{
    format: ExportFormat;
    label: string;
    description: string;
    icon: React.ReactNode;
    fileSize: string;
  }> = [
    {
      format: 'csv',
      label: 'CSV (Comma Separated)',
      description: 'Raw data for statistical analysis in Excel, R, SPSS',
      icon: <Table className="w-6 h-6" />,
      fileSize: '~5-50KB'
    },
    {
      format: 'excel',
      label: 'Excel Workbook',
      description: 'Multi-sheet report with overview, analysis, and raw data',
      icon: <FileSpreadsheet className="w-6 h-6" />,
      fileSize: '~15-100KB'
    },
    {
      format: 'pdf',
      label: 'PDF Report',
      description: 'Professional summary report for presentations',
      icon: <FileText className="w-6 h-6" />,
      fileSize: '~50-200KB'
    },
    {
      format: 'json',
      label: 'JSON Data',
      description: 'Complete dataset for developers and advanced analysis',
      icon: <File className="w-6 h-6" />,
      fileSize: '~10-80KB'
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus('idle');
    setErrorMessage('');

    try {
      await exportResults(results, study, selectedFormat, exportOptions);
      setExportStatus('success');
      setTimeout(() => {
        setExportStatus('idle');
        onClose();
      }, 2000);
    } catch (error) {
      setExportStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Export Study Results</h2>
            <p className="text-sm text-gray-600 mt-1">
              {study.name} • {results.length} participant{results.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Export Format</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formatOptions.map((option) => (
                <div
                  key={option.format}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedFormat === option.format
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedFormat(option.format)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded ${
                      selectedFormat === option.format ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{option.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      <p className="text-xs text-gray-500 mt-2">Est. size: {option.fileSize}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Export Options</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={exportOptions.includeMetadata}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Include Metadata</span>
                  <p className="text-xs text-gray-600">Study details, creation date, participant info</p>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={exportOptions.includeDemographics}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeDemographics: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Include Demographics</span>
                  <p className="text-xs text-gray-600">Participant demographic information</p>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={exportOptions.includeTimestamps}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeTimestamps: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Include Timestamps</span>
                  <p className="text-xs text-gray-600">Start time, completion time, duration data</p>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={exportOptions.includeAgreementScores}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeAgreementScores: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled
                />
                <div>
                  <span className="text-sm font-medium text-gray-400">Include Agreement Scores</span>
                  <p className="text-xs text-gray-500">Per card/category agreement analysis (coming soon)</p>
                </div>
              </label>
            </div>
          </div>

          {/* Export Status */}
          {exportStatus === 'success' && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800">Export completed successfully!</span>
            </div>
          )}

          {exportStatus === 'error' && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-800">{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Export will download to your browser's default download folder
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || results.length === 0}
              className={`px-6 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2 ${
                isExporting || results.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export {selectedFormat.toUpperCase()}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;