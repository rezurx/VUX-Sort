import React, { useState, useEffect } from 'react';
import { Study, CardSortResult, ViewMode, ParticipantSession } from './types';
import { saveToLocalStorage, loadFromLocalStorage, generateParticipantId, shuffleArray } from './utils';
import Dashboard from './components/Dashboard';
import StudyCreator from './components/StudyCreator';
import ParticipantCardSort from './components/ParticipantCardSort';
import ParticipantComplete from './components/ParticipantComplete';
import Analytics from './components/Analytics';

const VUX_SORT_STUDIES_KEY = 'vux-sort-studies';
const VUX_SORT_RESULTS_KEY = 'vux-sort-results';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [studies, setStudies] = useState<Study[]>([]);
  const [results, setResults] = useState<Record<string, CardSortResult[]>>({});
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<ParticipantSession | null>(null);

  // Load data on component mount
  useEffect(() => {
    const savedStudies = loadFromLocalStorage<Study[]>(VUX_SORT_STUDIES_KEY, []);
    const savedResults = loadFromLocalStorage<Record<string, CardSortResult[]>>(VUX_SORT_RESULTS_KEY, {});
    
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

  const handleParticipantComplete = (result: CardSortResult) => {
    // Save the result
    setResults(prev => ({
      ...prev,
      [result.participantId]: [result]
    }));

    // Update participant count on the study
    setStudies(prev => prev.map(study => 
      study.id === result.studyId 
        ? { ...study, participants: study.participants + 1 }
        : study
    ));

    setCurrentView('participant-complete');
  };

  const handleViewAnalytics = (study: Study) => {
    setSelectedStudy(study);
    setCurrentView('analytics');
  };

  const handleReturnToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedStudy(null);
    setCurrentParticipant(null);
  };

  const getStudyResults = (studyId: number): CardSortResult[] => {
    return Object.values(results).flat().filter(result => result.studyId === studyId);
  };

  // Prepare study for participant (shuffle cards if needed)
  const prepareStudyForParticipant = (study: Study): Study => {
    if (!study.settings.shuffleCards) return study;
    
    return {
      ...study,
      cards: shuffleArray(study.cards)
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'dashboard' && (
        <Dashboard
          studies={studies}
          results={results}
          onCreateStudy={handleCreateStudy}
          onEditStudy={handleEditStudy}
          onDeleteStudy={handleDeleteStudy}
          onViewAnalytics={handleViewAnalytics}
          onStartParticipant={handleStartParticipant}
          onDuplicateStudy={handleDuplicateStudy}
          onManageParticipants={() => {}} // Not implemented in basic App
        />
      )}

      {currentView === 'study-creator' && (
        <StudyCreator
          study={selectedStudy || undefined}
          onSave={handleSaveStudy}
          onCancel={handleReturnToDashboard}
        />
      )}

      {currentView === 'participant-view' && selectedStudy && currentParticipant && (
        <ParticipantCardSort
          study={prepareStudyForParticipant(selectedStudy)}
          participantId={currentParticipant.participantId}
          participantStartTime={currentParticipant.startTime}
          onComplete={handleParticipantComplete}
        />
      )}

      {currentView === 'participant-complete' && selectedStudy && currentParticipant && (
        <ParticipantComplete
          participantId={currentParticipant.participantId}
          studyName={selectedStudy.name}
          duration={Date.now() - currentParticipant.startTime}
          onReturnHome={handleReturnToDashboard}
        />
      )}

      {currentView === 'analytics' && selectedStudy && (
        <Analytics
          study={selectedStudy}
          results={getStudyResults(selectedStudy.id)}
          onBack={handleReturnToDashboard}
        />
      )}
    </div>
  );
};

export default App;