import React, { useState, useRef } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, FileText, X } from 'lucide-react';
import { TreeNode, StudyType, BulkUploadData, CSVParseResult } from '../types';
import { parseCSVFile } from '../utils';

interface BulkUploadProps {
  studyType: StudyType;
  onDataImported: (data: BulkUploadData) => void;
  onClose: () => void;
}

const BulkUpload: React.FC<BulkUploadProps> = ({ studyType, onDataImported, onClose }) => {
  const [uploadResults, setUploadResults] = useState<CSVParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<BulkUploadData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    let csvContent = '';
    let filename = '';

    switch (studyType) {
      case 'card-sorting':
      case 'open-card-sorting':
      case 'reverse-card-sorting':
        csvContent = 'text,description,category,priority,tags\n';
        csvContent += 'Product Reviews,Reviews and ratings from customers,Content,1,"content,reviews"\n';
        csvContent += 'Shipping Information,Details about delivery options,Service,2,"shipping,service"\n';
        csvContent += 'Return Policy,Information about returns and exchanges,Policy,3,"returns,policy"';
        filename = 'card-sorting-template.csv';
        break;
      
      case 'tree-testing':
        csvContent = 'name,parentId,url,level,description\n';
        csvContent += 'Home,,/home,0,Main homepage\n';
        csvContent += 'Products,1,/products,1,Product catalog\n';
        csvContent += 'Electronics,2,/products/electronics,2,Electronic items\n';
        csvContent += 'Phones,3,/products/electronics/phones,3,Mobile phones\n';
        csvContent += 'Support,1,/support,1,Customer support\n';
        csvContent += 'Contact,5,/support/contact,2,Contact information';
        filename = 'tree-testing-template.csv';
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadResults(null);
    setPreviewData(null);

    try {
      const parsedData = await parseCSVFile(file);
      const errors: string[] = [];
      
      if (parsedData.length === 0) {
        errors.push('No data found in CSV file');
      }

      const result: CSVParseResult = {
        data: parsedData,
        errors,
        headers: parsedData.length > 0 ? Object.keys(parsedData[0]) : []
      };

      setUploadResults(result);

      if (result.errors.length === 0) {
        const processedData = processCSVData(result.data);
        setPreviewData(processedData);
      }
    } catch (error) {
      setUploadResults({
        data: [],
        errors: [`Failed to parse CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        headers: []
      });
    }

    setIsProcessing(false);
  };

  const processCSVData = (data: any[]): BulkUploadData => {
    const result: BulkUploadData = {};

    switch (studyType) {
      case 'card-sorting':
      case 'open-card-sorting':
      case 'reverse-card-sorting':
        result.cards = data.map((row, index) => ({
          id: Date.now() + index,
          text: row.text || row.name || row.title || '',
          metadata: {
            description: row.description || '',
            category: row.category || '',
            priority: parseInt(row.priority) || 0,
            tags: row.tags ? row.tags.split(',').map((tag: string) => tag.trim()) : []
          }
        })).filter(card => card.text.trim() !== '');

        // Extract categories if they exist
        const categories = new Set(data.map(row => row.category).filter(Boolean));
        result.categories = Array.from(categories).map((name, index) => ({
          id: Date.now() + index + 1000,
          name: name as string,
          cards: []
        }));
        break;

      case 'tree-testing':
        // Process tree structure
        const nodes: TreeNode[] = data.map((row, index) => ({
          id: Date.now() + index,
          name: row.name || '',
          parentId: row.parentId ? parseInt(row.parentId) : undefined,
          children: [],
          level: parseInt(row.level) || 0,
          url: row.url || '',
        })).filter(node => node.name.trim() !== '');

        // Build tree structure
        const nodeMap = new Map(nodes.map(node => [node.id, node]));
        const rootNodes: TreeNode[] = [];

        nodes.forEach(node => {
          if (node.parentId && nodeMap.has(node.parentId)) {
            const parent = nodeMap.get(node.parentId)!;
            parent.children.push(node);
          } else {
            rootNodes.push(node);
          }
        });

        result.treeStructure = rootNodes;

        // Extract tasks if they exist
        if (data.some(row => row.task)) {
          result.tasks = [...new Set(data.map(row => row.task).filter(Boolean))];
        }
        break;
    }

    return result;
  };

  const handleImport = () => {
    if (previewData) {
      onDataImported(previewData);
      onClose();
    }
  };

  const getInstructions = () => {
    switch (studyType) {
      case 'card-sorting':
      case 'open-card-sorting':
      case 'reverse-card-sorting':
        return {
          title: 'Card Data Format',
          description: 'Upload a CSV file with card information. Required column: "text". Optional: "description", "category", "priority", "tags".',
          example: 'text,description,category\nProduct Reviews,Customer feedback,Content'
        };
      
      case 'tree-testing':
        return {
          title: 'Tree Structure Format',
          description: 'Upload a CSV file with navigation structure. Required: "name", "level". Optional: "parentId", "url", "description".',
          example: 'name,parentId,level\nHome,,0\nProducts,1,1\nElectronics,2,2'
        };
      
      default:
        return {
          title: 'Data Format',
          description: 'Upload a CSV file with your data.',
          example: ''
        };
    }
  };

  const instructions = getInstructions();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Upload Data</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">{instructions.title}</h3>
            <p className="text-blue-800 mb-3">{instructions.description}</p>
            {instructions.example && (
              <div className="bg-blue-100 rounded p-2 text-sm font-mono text-blue-900">
                {instructions.example}
              </div>
            )}
          </div>

          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Need a template?</p>
                <p className="text-sm text-gray-600">Download a sample CSV file with the correct format</p>
              </div>
            </div>
            <button
              onClick={downloadTemplate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Template</span>
            </button>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">Upload CSV File</p>
              <p className="text-gray-600">Choose a CSV file from your computer</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Choose File'}
              </button>
            </div>
          </div>

          {/* Upload Results */}
          {uploadResults && (
            <div className="space-y-4">
              {uploadResults.errors.length > 0 ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-medium text-red-900">Upload Errors</h3>
                  </div>
                  <ul className="space-y-1 text-sm text-red-800">
                    {uploadResults.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-medium text-green-900">Upload Successful</h3>
                  </div>
                  <p className="text-sm text-green-800">
                    Successfully parsed {uploadResults.data.length} rows from your CSV file.
                  </p>
                </div>
              )}

              {/* Preview Data */}
              {previewData && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Preview</h3>
                  
                  {previewData.cards && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Cards ({previewData.cards.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                        {previewData.cards.slice(0, 12).map(card => (
                          <div key={card.id} className="bg-white border rounded p-2 text-xs">
                            <div className="font-medium truncate">{card.text}</div>
                            {card.metadata?.category && (
                              <div className="text-gray-500 truncate">{card.metadata.category}</div>
                            )}
                          </div>
                        ))}
                        {previewData.cards.length > 12 && (
                          <div className="bg-gray-200 border rounded p-2 text-xs text-center text-gray-600">
                            +{previewData.cards.length - 12} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {previewData.categories && previewData.categories.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Categories ({previewData.categories.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {previewData.categories.map(category => (
                          <span key={category.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {previewData.treeStructure && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Tree Structure ({previewData.treeStructure.length} root nodes)
                      </h4>
                      <div className="bg-white border rounded p-3 max-h-40 overflow-y-auto">
                        {previewData.treeStructure.slice(0, 5).map(node => (
                          <div key={node.id} className="text-xs mb-1">
                            {'  '.repeat(node.level)}{node.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {previewData.tasks && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Tasks ({previewData.tasks.length})
                      </h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {previewData.tasks.map((task, index) => (
                          <div key={index} className="bg-white border rounded p-2 text-xs">
                            {task}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          {previewData && uploadResults?.errors.length === 0 && (
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Import Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;