import React, { useState } from 'react';
import { Users, Mail, Download, Upload, Link2, UserPlus, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Study, ParticipantInvite, DemographicField } from '../types';
import { 
  generateParticipantCSVTemplate, 
  parseParticipantCSV, 
  createParticipantInvites,
  generateParticipantLink,
  calculateParticipantStats
} from '../utils/participantUtils';

interface ParticipantManagerProps {
  study: Study;
  onUpdateStudy: (study: Study) => void;
  onBack: () => void;
}

const ParticipantManager: React.FC<ParticipantManagerProps> = ({ study, onUpdateStudy, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'invite' | 'bulk-upload' | 'demographics'>('overview');
  const [bulkCSVText, setBulkCSVText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [newDemographicField, setNewDemographicField] = useState<Partial<DemographicField>>({
    name: '',
    type: 'text',
    required: false
  });

  const invites = study.invites || [];
  const participantConfig = study.participantConfig || {
    requireDemographics: false,
    demographicFields: [],
    allowAnonymous: true,
    requireEmail: false
  };

  const stats = calculateParticipantStats(invites);

  const handleDownloadTemplate = () => {
    const template = generateParticipantCSVTemplate(participantConfig.demographicFields);
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${study.name}_participant_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleBulkUpload = () => {
    if (!bulkCSVText.trim()) {
      setUploadError('Please paste CSV content');
      return;
    }

    try {
      const participantData = parseParticipantCSV(bulkCSVText);
      if (participantData.length === 0) {
        setUploadError('No valid participants found in CSV');
        return;
      }

      const newInvites = createParticipantInvites(study.id, participantData);
      const updatedStudy = {
        ...study,
        invites: [...invites, ...newInvites]
      };

      onUpdateStudy(updatedStudy);
      setUploadSuccess(`Successfully added ${newInvites.length} participants`);
      setBulkCSVText('');
      setUploadError(null);
      setActiveTab('overview');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to parse CSV');
    }
  };

  const handleCopyLink = (inviteCode: string) => {
    const link = generateParticipantLink(study.id, inviteCode);
    navigator.clipboard.writeText(link);
    // You could add a toast notification here
  };

  const handleAddDemographicField = () => {
    if (!newDemographicField.name) return;

    const field: DemographicField = {
      id: `field_${Date.now()}`,
      name: newDemographicField.name,
      type: newDemographicField.type || 'text',
      required: newDemographicField.required || false,
      options: newDemographicField.options,
      placeholder: newDemographicField.placeholder
    };

    const updatedConfig = {
      ...participantConfig,
      demographicFields: [...participantConfig.demographicFields, field]
    };

    onUpdateStudy({
      ...study,
      participantConfig: updatedConfig
    });

    setNewDemographicField({ name: '', type: 'text', required: false });
  };

  const getStatusIcon = (status: ParticipantInvite['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'started': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'expired': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Mail className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ←
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Participant Management</h1>
                <p className="text-sm text-gray-600">{study.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Success/Error Messages */}
        {uploadSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700">{uploadSuccess}</span>
            <button onClick={() => setUploadSuccess(null)} className="ml-auto text-green-500 hover:text-green-700">×</button>
          </div>
        )}

        {uploadError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{uploadError}</span>
            <button onClick={() => setUploadError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Invited</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.responseRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Users },
              { id: 'bulk-upload', label: 'Bulk Upload', icon: Upload },
              { id: 'demographics', label: 'Demographics', icon: UserPlus }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow border">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Participants ({invites.length})</h3>
              <button
                onClick={handleDownloadTemplate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Template</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invited</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invites.map(invite => (
                    <tr key={invite.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {invite.firstName && invite.lastName 
                              ? `${invite.firstName} ${invite.lastName}` 
                              : invite.email}
                          </div>
                          {invite.firstName && <div className="text-sm text-gray-500">{invite.email}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(invite.status)}
                          <span className="text-sm text-gray-900 capitalize">{invite.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invite.invitedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invite.completedAt ? new Date(invite.completedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleCopyLink(invite.inviteCode)}
                          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          title="Copy participant link"
                        >
                          <Link2 className="w-4 h-4" />
                          <span>Copy Link</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {invites.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No participants yet</h3>
                  <p className="text-gray-600 mb-4">Upload participants to start collecting responses</p>
                  <button
                    onClick={() => setActiveTab('bulk-upload')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Upload Participants
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bulk-upload' && (
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Bulk Upload Participants</h3>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Email column is required</li>
                  <li>• Optional: firstName, lastName columns</li>
                  <li>• Any additional columns will be stored as custom fields</li>
                  <li>• First row should contain column headers</li>
                </ul>
                <button
                  onClick={handleDownloadTemplate}
                  className="mt-3 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download Template</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste CSV Content
                </label>
                <textarea
                  value={bulkCSVText}
                  onChange={(e) => setBulkCSVText(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email,firstName,lastName&#10;john@example.com,John,Doe&#10;jane@example.com,Jane,Smith"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleBulkUpload}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Participants</span>
                </button>
                <button
                  onClick={() => setBulkCSVText('')}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'demographics' && (
          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Demographic Fields</h3>
            
            {/* Add New Field */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-4">Add Demographic Field</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                  <input
                    type="text"
                    value={newDemographicField.name || ''}
                    onChange={(e) => setNewDemographicField({...newDemographicField, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Age, Gender, Occupation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
                  <select
                    value={newDemographicField.type || 'text'}
                    onChange={(e) => setNewDemographicField({...newDemographicField, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="select">Select</option>
                    <option value="radio">Radio</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="date">Date</option>
                  </select>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newDemographicField.required || false}
                      onChange={(e) => setNewDemographicField({...newDemographicField, required: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Required</span>
                  </label>
                </div>
                <div>
                  <button
                    onClick={handleAddDemographicField}
                    disabled={!newDemographicField.name}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Add Field
                  </button>
                </div>
              </div>
            </div>

            {/* Current Fields */}
            <div className="space-y-3">
              {participantConfig.demographicFields.map(field => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{field.name}</div>
                    <div className="text-sm text-gray-500">
                      Type: {field.type} {field.required && '• Required'}
                    </div>
                  </div>
                  <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                </div>
              ))}
              
              {participantConfig.demographicFields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No demographic fields configured. Add fields above to collect participant information.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantManager;