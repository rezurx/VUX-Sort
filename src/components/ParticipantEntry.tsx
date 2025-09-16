import React, { useState, useEffect } from 'react';
import { Users, Key, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { Study, ParticipantInvite, ParticipantSession } from '../types';
import { findParticipantByCode, isInviteExpired, isValidInviteCode } from '../utils/participantUtils';
import DemographicsForm from './DemographicsForm';

interface ParticipantEntryProps {
  studies: Study[];
  inviteCode?: string; // From URL parameter
  onStartStudy: (study: Study, session: ParticipantSession) => void;
}

const ParticipantEntry: React.FC<ParticipantEntryProps> = ({
  studies,
  inviteCode: urlInviteCode,
  onStartStudy
}) => {
  const [inviteCode, setInviteCode] = useState(urlInviteCode || '');
  const [currentStudy, setCurrentStudy] = useState<Study | null>(null);
  const [currentInvite, setCurrentInvite] = useState<ParticipantInvite | null>(null);
  const [showDemographics, setShowDemographics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-validate if invite code is provided in URL
  useEffect(() => {
    if (urlInviteCode) {
      handleCodeSubmit();
    }
  }, [urlInviteCode]);

  const handleCodeSubmit = () => {
    setError(null);
    setIsLoading(true);

    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      setIsLoading(false);
      return;
    }

    if (!isValidInviteCode(inviteCode.toUpperCase())) {
      setError('Invalid invite code format. Code should be 8 characters (letters and numbers)');
      setIsLoading(false);
      return;
    }

    // Find the study and invite
    let foundStudy: Study | null = null;
    let foundInvite: ParticipantInvite | null = null;

    for (const study of studies) {
      if (study.invites) {
        const invite = findParticipantByCode(study.invites, inviteCode.toUpperCase());
        if (invite) {
          foundStudy = study;
          foundInvite = invite;
          break;
        }
      }
    }

    if (!foundStudy || !foundInvite) {
      setError('Invalid invite code. Please check the code and try again.');
      setIsLoading(false);
      return;
    }

    // Check if invite is expired
    const expirationDays = foundStudy.participantConfig?.expirationDays || 30;
    if (isInviteExpired(foundInvite, expirationDays)) {
      setError('This invite has expired. Please contact the study administrator.');
      setIsLoading(false);
      return;
    }

    // Check if already completed
    if (foundInvite.status === 'completed') {
      setError('You have already completed this study. Thank you for your participation!');
      setIsLoading(false);
      return;
    }

    setCurrentStudy(foundStudy);
    setCurrentInvite(foundInvite);

    // Show demographics form if required
    if (foundStudy.participantConfig?.requireDemographics && 
        foundStudy.participantConfig.demographicFields.length > 0) {
      setShowDemographics(true);
    } else {
      // Start study directly
      startStudy({}, {});
    }

    setIsLoading(false);
  };

  const startStudy = (demographics: Record<string, any>, participantInfo: { name?: string; email?: string }) => {
    if (!currentStudy || !currentInvite) return;

    const session: ParticipantSession = {
      participantId: `${currentInvite.id}_${Date.now()}`,
      studyId: currentStudy.id,
      startTime: Date.now(),
      isComplete: false,
      studyType: currentStudy.type,
      inviteCode: currentInvite.inviteCode,
      demographics,
      participantName: participantInfo.name || currentInvite.firstName,
      participantEmail: participantInfo.email || currentInvite.email
    };

    // Note: In a real app, you'd update invite status to 'started' in the backend
    // For now, we'll pass the session and let the parent handle it

    onStartStudy(currentStudy, session);
  };

  const handleDemographicsSubmit = (demographics: Record<string, any>, participantInfo: { name?: string; email?: string }) => {
    startStudy(demographics, participantInfo);
  };

  const handleDemographicsSkip = () => {
    if (currentStudy?.participantConfig?.allowAnonymous !== false) {
      startStudy({}, {});
    }
  };

  // Show demographics form
  if (showDemographics && currentStudy && currentInvite) {
    return (
      <DemographicsForm
        fields={currentStudy.participantConfig?.demographicFields || []}
        onSubmit={handleDemographicsSubmit}
        onSkip={handleDemographicsSkip}
        allowSkip={currentStudy.participantConfig?.allowAnonymous !== false}
        studyName={currentStudy.name}
      />
    );
  }

  // Show invite code entry form
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Study</h1>
            <p className="text-gray-600">
              Enter your invite code to participate in the research study.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          )}

          {/* Success message for valid code */}
          {currentStudy && currentInvite && !showDemographics && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium text-green-900">Valid Invite Code</span>
              </div>
              <div className="text-green-700 text-sm">
                <div>Study: <strong>{currentStudy.name}</strong></div>
                {currentInvite.firstName && (
                  <div>Welcome, {currentInvite.firstName}!</div>
                )}
              </div>
            </div>
          )}

          {/* Invite code form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invite Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Enter 8-character code"
                  maxLength={8}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-wider"
                  style={{ letterSpacing: '0.2em' }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                You should have received this code via email or from the researcher.
              </p>
            </div>

            <button
              onClick={handleCodeSubmit}
              disabled={isLoading || !inviteCode.trim()}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Join Study</span>
                </>
              )}
            </button>

            {/* Study preview for valid codes */}
            {currentStudy && currentInvite && !showDemographics && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-900 mb-3">Study Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div><strong>Study:</strong> {currentStudy.name}</div>
                  {currentStudy.description && (
                    <div><strong>Description:</strong> {currentStudy.description}</div>
                  )}
                  <div><strong>Type:</strong> {currentStudy.type.replace('-', ' ')}</div>
                  <div><strong>Estimated Time:</strong> 10-15 minutes</div>
                </div>
                
                <button
                  onClick={() => startStudy({}, {})}
                  className="w-full mt-4 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Start Study Now</span>
                </button>
              </div>
            )}
          </div>

          {/* Help text */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Don't have an invite code? Contact the research team or check your email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantEntry;