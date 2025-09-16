import React from 'react';
import { CheckCircle, Home } from 'lucide-react';
import { formatDuration } from '../utils';

interface ParticipantCompleteProps {
  participantId: string;
  studyName: string;
  duration: number;
  onReturnHome: () => void;
}

const ParticipantComplete: React.FC<ParticipantCompleteProps> = ({
  participantId,
  studyName,
  duration,
  onReturnHome
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
        <p className="text-gray-600 mb-6">
          You have successfully completed the card sorting study "{studyName}".
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Participant ID:</span>
              <span className="font-medium">{participantId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completion Time:</span>
              <span className="font-medium">{formatDuration(duration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Your responses have been recorded and will help improve the user experience. 
          If you have any questions about this study, please contact the researcher.
        </p>
        
        <button
          onClick={onReturnHome}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
        >
          <Home className="w-4 h-4" />
          <span>Return to Homepage</span>
        </button>
      </div>
    </div>
  );
};

export default ParticipantComplete;