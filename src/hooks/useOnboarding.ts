import { useState, useEffect, useRef, useCallback } from 'react';

export interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for the element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    type: 'click' | 'hover' | 'input' | 'wait';
    description: string;
    optional?: boolean;
  };
  skippable?: boolean;
  autoAdvance?: boolean;
  duration?: number; // for auto-advance steps
  prerequisites?: string[]; // step IDs that must be completed first
  validation?: () => boolean; // custom validation function
}

export interface OnboardingTour {
  id: string;
  name: string;
  description: string;
  category: 'first-time' | 'feature' | 'advanced' | 'troubleshooting';
  steps: OnboardingStep[];
  estimatedDuration: number; // in minutes
  prerequisites?: string[]; // tour IDs
  metadata?: {
    version: string;
    lastUpdated: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
}

interface OnboardingState {
  currentTour: string | null;
  currentStep: number;
  isActive: boolean;
  completedTours: string[];
  completedSteps: string[];
  skippedSteps: string[];
  userPreferences: {
    autoStart: boolean;
    showHints: boolean;
    playSound: boolean;
    animationSpeed: 'slow' | 'normal' | 'fast';
  };
}

const ONBOARDING_STORAGE_KEY = 'vux-sort-onboarding';

const DEFAULT_STATE: OnboardingState = {
  currentTour: null,
  currentStep: 0,
  isActive: false,
  completedTours: [],
  completedSteps: [],
  skippedSteps: [],
  userPreferences: {
    autoStart: true,
    showHints: true,
    playSound: false,
    animationSpeed: 'normal',
  },
};

export const useOnboarding = () => {
  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [availableTours, setAvailableTours] = useState<OnboardingTour[]>([]);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const soundRef = useRef<HTMLAudioElement | null>(null);

  // Load saved state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (saved) {
        const savedState = JSON.parse(saved);
        setState(prev => ({ ...prev, ...savedState }));
      }
    } catch (error) {
      console.warn('Failed to load onboarding state:', error);
    }
  }, []);

  // Save state
  const saveState = useCallback((newState: Partial<OnboardingState>) => {
    try {
      const stateToSave = { ...state, ...newState };
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(stateToSave));
      setState(stateToSave);
    } catch (error) {
      console.warn('Failed to save onboarding state:', error);
    }
  }, [state]);

  // Tour management
  const registerTour = useCallback((tour: OnboardingTour) => {
    setAvailableTours(prev => {
      const existing = prev.findIndex(t => t.id === tour.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = tour;
        return updated;
      }
      return [...prev, tour];
    });
  }, []);

  const startTour = useCallback(async (tourId: string, stepIndex: number = 0) => {
    const tour = availableTours.find(t => t.id === tourId);
    if (!tour) {
      console.warn(`Tour "${tourId}" not found`);
      return false;
    }

    // Check prerequisites
    if (tour.prerequisites) {
      const missingPrereqs = tour.prerequisites.filter(
        prereqId => !state.completedTours.includes(prereqId)
      );
      if (missingPrereqs.length > 0) {
        console.warn(`Tour "${tourId}" requires completing: ${missingPrereqs.join(', ')}`);
        return false;
      }
    }

    // Check step prerequisites
    const step = tour.steps[stepIndex];
    if (step?.prerequisites) {
      const missingStepPrereqs = step.prerequisites.filter(
        stepId => !state.completedSteps.includes(stepId)
      );
      if (missingStepPrereqs.length > 0) {
        console.warn(`Step "${step.id}" requires completing steps: ${missingStepPrereqs.join(', ')}`);
        return false;
      }
    }

    saveState({
      currentTour: tourId,
      currentStep: stepIndex,
      isActive: true,
    });

    // Play start sound if enabled
    if (state.userPreferences.playSound && soundRef.current) {
      soundRef.current.play().catch(() => {
        // Ignore sound errors
      });
    }

    await highlightStep(tour, stepIndex);
    return true;
  }, [availableTours, state, saveState]);

  const nextStep = useCallback(async () => {
    if (!state.currentTour || !state.isActive) return false;

    const tour = availableTours.find(t => t.id === state.currentTour);
    if (!tour) return false;

    const currentStep = tour.steps[state.currentStep];
    if (currentStep) {
      // Mark step as completed
      const updatedCompleted = [...state.completedSteps, currentStep.id];
      saveState({
        completedSteps: updatedCompleted,
      });
    }

    const nextStepIndex = state.currentStep + 1;

    if (nextStepIndex >= tour.steps.length) {
      // Tour completed
      return completeTour();
    }

    saveState({
      currentStep: nextStepIndex,
    });

    await highlightStep(tour, nextStepIndex);
    return true;
  }, [state, availableTours, saveState]);

  const previousStep = useCallback(async () => {
    if (!state.currentTour || !state.isActive || state.currentStep <= 0) return false;

    const tour = availableTours.find(t => t.id === state.currentTour);
    if (!tour) return false;

    const prevStepIndex = state.currentStep - 1;
    saveState({
      currentStep: prevStepIndex,
    });

    await highlightStep(tour, prevStepIndex);
    return true;
  }, [state, availableTours, saveState]);

  const skipStep = useCallback(async () => {
    if (!state.currentTour || !state.isActive) return false;

    const tour = availableTours.find(t => t.id === state.currentTour);
    if (!tour) return false;

    const currentStep = tour.steps[state.currentStep];
    if (currentStep && !currentStep.skippable) {
      console.warn('Current step cannot be skipped');
      return false;
    }

    if (currentStep) {
      // Mark step as skipped
      const updatedSkipped = [...state.skippedSteps, currentStep.id];
      saveState({
        skippedSteps: updatedSkipped,
      });
    }

    return nextStep();
  }, [state, availableTours, saveState, nextStep]);

  const completeTour = useCallback(() => {
    if (!state.currentTour) return false;

    const updatedCompleted = [...state.completedTours, state.currentTour];

    saveState({
      currentTour: null,
      currentStep: 0,
      isActive: false,
      completedTours: updatedCompleted,
    });

    setHighlightedElement(null);

    // Play completion sound if enabled
    if (state.userPreferences.playSound && soundRef.current) {
      // Play a different sound for completion
      soundRef.current.play().catch(() => {
        // Ignore sound errors
      });
    }

    return true;
  }, [state, saveState]);

  const exitTour = useCallback(() => {
    saveState({
      currentTour: null,
      currentStep: 0,
      isActive: false,
    });

    setHighlightedElement(null);
    return true;
  }, [saveState]);

  const restartTour = useCallback((tourId?: string) => {
    const targetTour = tourId || state.currentTour;
    if (!targetTour) return false;

    return startTour(targetTour, 0);
  }, [state.currentTour, startTour]);

  // Element highlighting
  const highlightStep = useCallback(async (tour: OnboardingTour, stepIndex: number) => {
    const step = tour.steps[stepIndex];
    if (!step) return;

    // Clear previous highlight
    setHighlightedElement(null);

    if (step.target) {
      // Wait a bit for DOM updates
      await new Promise(resolve => setTimeout(resolve, 100));

      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        setHighlightedElement(element);

        // Scroll element into view
        element.scrollIntoView({
          behavior: state.userPreferences.animationSpeed === 'fast' ? 'auto' : 'smooth',
          block: 'center',
        });

        // Focus element if it's focusable
        if (element.tabIndex >= 0 ||
            element.matches('button, input, select, textarea, a[href]')) {
          element.focus();
        }
      }
    }

    // Handle auto-advance
    if (step.autoAdvance && step.duration) {
      setTimeout(() => {
        if (state.isActive && state.currentStep === stepIndex) {
          nextStep();
        }
      }, step.duration);
    }
  }, [state.userPreferences.animationSpeed, state.isActive, state.currentStep, nextStep]);

  // Utility functions
  const getCurrentTour = useCallback((): OnboardingTour | null => {
    if (!state.currentTour) return null;
    return availableTours.find(t => t.id === state.currentTour) || null;
  }, [state.currentTour, availableTours]);

  const getCurrentStep = useCallback((): OnboardingStep | null => {
    const tour = getCurrentTour();
    if (!tour) return null;
    return tour.steps[state.currentStep] || null;
  }, [getCurrentTour, state.currentStep]);

  const getProgress = useCallback((): { current: number; total: number; percentage: number } => {
    const tour = getCurrentTour();
    if (!tour) return { current: 0, total: 0, percentage: 0 };

    return {
      current: state.currentStep + 1,
      total: tour.steps.length,
      percentage: ((state.currentStep + 1) / tour.steps.length) * 100,
    };
  }, [getCurrentTour, state.currentStep]);

  const isStepCompleted = useCallback((stepId: string): boolean => {
    return state.completedSteps.includes(stepId);
  }, [state.completedSteps]);

  const isTourCompleted = useCallback((tourId: string): boolean => {
    return state.completedTours.includes(tourId);
  }, [state.completedTours]);

  const getAvailableTours = useCallback((): OnboardingTour[] => {
    return availableTours.filter(tour => {
      // Check prerequisites
      if (tour.prerequisites) {
        return tour.prerequisites.every(prereqId =>
          state.completedTours.includes(prereqId)
        );
      }
      return true;
    });
  }, [availableTours, state.completedTours]);

  const resetProgress = useCallback((tourId?: string) => {
    if (tourId) {
      // Reset specific tour
      const updatedCompleted = state.completedTours.filter(id => id !== tourId);
      const tour = availableTours.find(t => t.id === tourId);
      const stepIds = tour?.steps.map(s => s.id) || [];
      const updatedCompletedSteps = state.completedSteps.filter(id => !stepIds.includes(id));
      const updatedSkippedSteps = state.skippedSteps.filter(id => !stepIds.includes(id));

      saveState({
        completedTours: updatedCompleted,
        completedSteps: updatedCompletedSteps,
        skippedSteps: updatedSkippedSteps,
      });
    } else {
      // Reset all progress
      saveState({
        ...DEFAULT_STATE,
        userPreferences: state.userPreferences, // Keep user preferences
      });
    }
  }, [state, availableTours, saveState]);

  const updatePreferences = useCallback((preferences: Partial<OnboardingState['userPreferences']>) => {
    saveState({
      userPreferences: { ...state.userPreferences, ...preferences },
    });
  }, [state.userPreferences, saveState]);

  return {
    // State
    state,
    highlightedElement,
    availableTours,

    // Tour management
    registerTour,
    startTour,
    nextStep,
    previousStep,
    skipStep,
    completeTour,
    exitTour,
    restartTour,

    // Utilities
    getCurrentTour,
    getCurrentStep,
    getProgress,
    isStepCompleted,
    isTourCompleted,
    getAvailableTours,
    resetProgress,
    updatePreferences,

    // Refs
    overlayRef,
    tooltipRef,
    soundRef,
  };
};

export default useOnboarding;