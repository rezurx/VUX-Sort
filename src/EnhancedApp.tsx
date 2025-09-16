import React, { useState, useEffect } from 'react';
import { Study, StudyResult, ViewMode, ParticipantSession } from './types';
import { saveToLocalStorage, loadFromLocalStorage, generateParticipantId, shuffleArray } from './utils';
import Dashboard from './components/Dashboard';
import EnhancedStudyCreator from './components/EnhancedStudyCreator';
import ParticipantCardSort from './components/ParticipantCardSort';
import OpenCardSort from './components/OpenCardSort';
import TreeTest from './components/TreeTest';
import ReverseCardSort from './components/ReverseCardSort';
import ParticipantComplete from './components/ParticipantComplete';
import EnhancedAnalytics from './components/EnhancedAnalytics';
import ParticipantManager from './components/ParticipantManager';
import ParticipantEntry from './components/ParticipantEntry';

const VUX_SORT_STUDIES_KEY = 'vux-sort-studies';
const VUX_SORT_RESULTS_KEY = 'vux-sort-results';

const EnhancedApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [studies, setStudies] = useState<Study[]>([]);
  const [results, setResults] = useState<Record<string, StudyResult[]>>({});
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<ParticipantSession | null>(null);

  // Load data on component mount
  useEffect(() => {
    const savedStudies = loadFromLocalStorage<Study[]>(VUX_SORT_STUDIES_KEY, []);
    const savedResults = loadFromLocalStorage<Record<string, StudyResult[]>>(VUX_SORT_RESULTS_KEY, {});
    
    setStudies(savedStudies);
    setResults(savedResults);
  }, []);

  // Save studies when they change
  useEffect(() => {
    saveToLocalStorage(VUX_SORT_STUDIES_KEY, studies);
  }, [studies]);

  // Save results when they change
  useEffect(() => {
    saveToLocalStorage(VUX_SORT_RESULTS_KEY, results);
  }, [results]);

  const handleCreateStudy = () => {
    setSelectedStudy(null);
    setCurrentView('study-creator');
  };

  const handleEditStudy = (study: Study) => {
    setSelectedStudy(study);
    setCurrentView('study-creator');
  };

  const handleSaveStudy = (study: Study) => {
    setStudies(prev => {
      const exists = prev.find(s => s.id === study.id);
      if (exists) {
        return prev.map(s => s.id === study.id ? study : s);
      } else {
        return [...prev, study];
      }
    });
    setCurrentView('dashboard');
    setSelectedStudy(null);
  };

  const handleDeleteStudy = (studyId: number) => {
    setStudies(prev => prev.filter(s => s.id !== studyId));
    // Also remove related results
    setResults(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        updated[key] = updated[key].filter(result => result.studyId !== studyId);
        if (updated[key].length === 0) {
          delete updated[key];
        }
      });
      return updated;
    });
  };

  const handleDuplicateStudy = (study: Study) => {
    const duplicatedStudy: Study = {
      ...study,
      id: Date.now(),
      name: `${study.name} (Copy)`,
      participants: 0,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    setStudies(prev => [...prev, duplicatedStudy]);
  };

  const handleStartParticipant = (study: Study) => {
    const participantId = generateParticipantId();
    const startTime = Date.now();
    
    const session: ParticipantSession = {
      participantId,
      studyId: study.id,
      startTime,
      isComplete: false,
      studyType: study.type
    };
    
    setCurrentParticipant(session);
    setSelectedStudy(study);
    setCurrentView('participant-view');
  };

  const handleParticipantComplete = (result: StudyResult) => {
    // Save the result
    setResults(prev => ({
      ...prev,
      [result.participantId]: [result]
    }));

    // Update participant count and invite status
    setStudies(prev => prev.map(study => {
      if (study.id === result.studyId) {
        const updatedInvites = study.invites?.map(invite => {
          if (invite.inviteCode === result.inviteCode) {
            return {
              ...invite,
              status: 'completed' as const,
              completedAt: new Date().toISOString()
            };
          }
          return invite;
        });

        return { 
          ...study, 
          participants: study.participants + 1,
          invites: updatedInvites
        };
      }
      return study;
    }));

    setCurrentView('participant-complete');
  };

  const handleViewAnalytics = (study: Study) => {
    setSelectedStudy(study);
    setCurrentView('analytics');
  };

  const handleManageParticipants = (study: Study) => {
    setSelectedStudy(study);
    setCurrentView('participant-manager');
  };

  const handleReturnToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedStudy(null);
    setCurrentParticipant(null);
  };

  const getStudyResults = (studyId: number): StudyResult[] => {
    return Object.values(results).flat().filter(result => result.studyId === studyId);
  };

  // Prepare study for participant (shuffle cards if needed)
  const prepareStudyForParticipant = (study: Study): Study => {
    if (study.settings.shuffleCards && study.cards) {
      return {
        ...study,
        cards: shuffleArray(study.cards)
      };
    }
    return study;
  };

  // Render appropriate participant component based on study type
  const renderParticipantComponent = () => {
    if (!selectedStudy || !currentParticipant) return null;

    const preparedStudy = prepareStudyForParticipant(selectedStudy);
    const commonProps = {
      study: preparedStudy,
      participantId: currentParticipant.participantId,
      participantStartTime: currentParticipant.startTime,
      onComplete: handleParticipantComplete
    };

    switch (selectedStudy.type) {
      case 'card-sorting':
        return <ParticipantCardSort {...commonProps} />;
      
      case 'open-card-sorting':
        return <OpenCardSort {...commonProps} />;
      
      case 'tree-testing':
        return <TreeTest {...commonProps} />;
      
      case 'reverse-card-sorting':
        return <ReverseCardSort {...commonProps} />;
      
      default:
        return <ParticipantCardSort {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'dashboard' && (
        <Dashboard
          studies={studies}
          results={results as any}
          onCreateStudy={handleCreateStudy}
          onEditStudy={handleEditStudy}
          onDeleteStudy={handleDeleteStudy}
          onViewAnalytics={handleViewAnalytics}
          onStartParticipant={handleStartParticipant}
          onDuplicateStudy={handleDuplicateStudy}
          onManageParticipants={handleManageParticipants}
        />
      )}

      {currentView === 'study-creator' && (
        <EnhancedStudyCreator
          study={selectedStudy || undefined}
          onSave={handleSaveStudy}
          onCancel={handleReturnToDashboard}
        />
      )}

      {currentView === 'participant-view' && renderParticipantComponent()}

      {currentView === 'participant-complete' && selectedStudy && currentParticipant && (
        <ParticipantComplete
          participantId={currentParticipant.participantId}
          studyName={selectedStudy.name}
          duration={Date.now() - currentParticipant.startTime}
          onReturnHome={handleReturnToDashboard}
        />
      )}

      {currentView === 'analytics' && selectedStudy && (
        <EnhancedAnalytics
          study={selectedStudy}
          results={getStudyResults(selectedStudy.id)}
          onBack={handleReturnToDashboard}
        />
      )}

      {currentView === 'participant-manager' && selectedStudy && (
        <ParticipantManager
          study={selectedStudy}
          onUpdateStudy={handleSaveStudy}
          onBack={handleReturnToDashboard}
        />
      )}

      {currentView === 'participant-entry' && (
        <ParticipantEntry
          studies={studies}
          onStartStudy={(study, session) => {
            setSelectedStudy(study);
            setCurrentParticipant(session);
            setCurrentView('participant-view');
          }}
        />
      )}
    </div>
  );
};

export default EnhancedApp;