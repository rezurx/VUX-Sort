import React, { useEffect, useState } from 'react';
import {
  ChevronLeft, ChevronRight, X, Play, RotateCcw, SkipForward,
  HelpCircle, Clock, User, Book, Lightbulb, Settings
} from 'lucide-react';
import { useOnboarding } from '../hooks/useOnboarding';
import { useThemeContext } from '../hooks/useTheme';
import { useAccessibility } from '../hooks/useAccessibility';

interface OnboardingTourProps {
  className?: string;
}

interface TooltipPosition {
  top: number;
  left: number;
  arrow: 'top' | 'bottom' | 'left' | 'right';
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ className = '' }) => {
  const {
    state,
    highlightedElement,
    getCurrentStep,
    getProgress,
    nextStep,
    previousStep,
    skipStep,
    exitTour,
    restartTour,
    startTour,
    getAvailableTours,
  } = useOnboarding();

  const { getThemeVariable } = useThemeContext();
  const { announce } = useAccessibility();

  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    arrow: 'top',
  });
  const [showTourSelector, setShowTourSelector] = useState(false);

  const currentStep = getCurrentStep();
  const progress = getProgress();

  // Calculate tooltip position
  useEffect(() => {
    if (highlightedElement && currentStep) {
      const rect = highlightedElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const tooltipWidth = 320;
      const tooltipHeight = 200;
      const margin = 16;

      let top = rect.bottom + margin;
      let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      let arrow: 'top' | 'bottom' | 'left' | 'right' = 'top';

      // Adjust for position preference
      if (currentStep.position === 'top') {
        top = rect.top - tooltipHeight - margin;
        arrow = 'bottom';
      } else if (currentStep.position === 'left') {
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.left - tooltipWidth - margin;
        arrow = 'right';
      } else if (currentStep.position === 'right') {
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.right + margin;
        arrow = 'left';
      } else if (currentStep.position === 'center') {
        top = (viewportHeight / 2) - (tooltipHeight / 2);
        left = (viewportWidth / 2) - (tooltipWidth / 2);
        arrow = 'top';
      }

      // Adjust for viewport boundaries
      if (left < margin) {
        left = margin;
      } else if (left + tooltipWidth > viewportWidth - margin) {
        left = viewportWidth - tooltipWidth - margin;
      }

      if (top < margin) {
        top = rect.bottom + margin;
        arrow = 'top';
      } else if (top + tooltipHeight > viewportHeight - margin) {
        top = rect.top - tooltipHeight - margin;
        arrow = 'bottom';
      }

      setTooltipPosition({ top, left, arrow });
    }
  }, [highlightedElement, currentStep]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!state.isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          exitTour();
          announce('Onboarding tour exited');
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextStep();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          previousStep();
          break;
        case ' ':
          if (e.ctrlKey) {
            e.preventDefault();
            skipStep();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.isActive, exitTour, nextStep, previousStep, skipStep, announce]);

  const handleStepAction = async () => {
    if (!currentStep?.action) {
      await nextStep();
      return;
    }

    // Perform the step action
    switch (currentStep.action.type) {
      case 'click':
        if (highlightedElement) {
          highlightedElement.click();
          announce(`Clicked ${highlightedElement.tagName.toLowerCase()}`);
        }
        break;
      case 'input':
        if (highlightedElement && highlightedElement instanceof HTMLInputElement) {
          highlightedElement.focus();
          announce('Input field focused');
        }
        break;
      case 'wait':
        announce('Waiting for action completion');
        break;
      case 'hover':
        if (highlightedElement) {
          const event = new MouseEvent('mouseenter', { bubbles: true });
          highlightedElement.dispatchEvent(event);
          announce('Element hovered');
        }
        break;
    }

    if (!currentStep.action.optional) {
      setTimeout(async () => {
        await nextStep();
      }, 1000);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'first-time':
        return <User className="w-4 h-4" />;
      case 'feature':
        return <Lightbulb className="w-4 h-4" />;
      case 'advanced':
        return <Settings className="w-4 h-4" />;
      case 'troubleshooting':
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <Book className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return getThemeVariable('status-success');
      case 'intermediate':
        return getThemeVariable('status-warning');
      case 'advanced':
        return getThemeVariable('status-error');
      default:
        return getThemeVariable('status-info');
    }
  };

  if (!state.isActive) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={() => setShowTourSelector(true)}
          className={`
            px-4 py-2 rounded-lg shadow-lg transition-all duration-200
            bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)]
            hover:bg-[var(--color-accent-hover)]
            focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]
            flex items-center space-x-2 min-h-touch
          `}
          aria-label="Start onboarding tour"
        >
          <Play className="w-4 h-4" />
          <span className="text-sm font-medium">Help & Tours</span>
        </button>

        {/* Tour Selector Modal */}
        {showTourSelector && (
          <div className="fixed inset-0 bg-[var(--color-bg-overlay)] z-50 flex items-center justify-center p-4">
            <div className={`
              bg-[var(--color-bg-card)] rounded-xl shadow-[var(--shadow-xl)]
              max-w-2xl w-full max-h-96 overflow-y-auto
              p-6 relative
            `}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)] flex items-center">
                  <Book className="w-5 h-5 mr-2" />
                  Available Tours
                </h2>
                <button
                  onClick={() => setShowTourSelector(false)}
                  className="p-2 rounded-lg hover:bg-[var(--color-hover-bg)] text-[var(--color-text-secondary)]"
                  aria-label="Close tour selector"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {getAvailableTours().map((tour) => (
                  <div
                    key={tour.id}
                    className={`
                      p-4 rounded-lg border border-[var(--color-border-primary)]
                      hover:bg-[var(--color-hover-bg)] transition-colors
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getCategoryIcon(tour.category)}
                          <h3 className="font-semibold text-[var(--color-text-primary)]">
                            {tour.name}
                          </h3>
                          {tour.metadata?.difficulty && (
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: getDifficultyColor(tour.metadata.difficulty),
                                color: getThemeVariable('text-inverse'),
                              }}
                            >
                              {tour.metadata.difficulty}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                          {tour.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-[var(--color-text-tertiary)]">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {tour.estimatedDuration} min
                          </div>
                          <div>{tour.steps.length} steps</div>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          setShowTourSelector(false);
                          await startTour(tour.id);
                          announce(`Started tour: ${tour.name}`);
                        }}
                        className={`
                          ml-4 px-3 py-2 rounded-lg text-sm font-medium
                          bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)]
                          hover:bg-[var(--color-accent-hover)]
                          focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]
                          min-h-touch min-w-touch
                        `}
                      >
                        Start
                      </button>
                    </div>
                  </div>
                ))}

                {getAvailableTours().length === 0 && (
                  <div className="text-center py-8 text-[var(--color-text-secondary)]">
                    <Book className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No tours available at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Element Highlight */}
      {highlightedElement && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 4,
            left: highlightedElement.getBoundingClientRect().left - 4,
            width: highlightedElement.getBoundingClientRect().width + 8,
            height: highlightedElement.getBoundingClientRect().height + 8,
            border: `3px solid ${getThemeVariable('accent-primary')}`,
            borderRadius: '8px',
            boxShadow: `0 0 20px ${getThemeVariable('accent-primary')}40`,
            animation: 'pulse 2s infinite',
          }}
        />
      )}

      {/* Tooltip */}
      {currentStep && (
        <div
          className={`
            fixed z-50 w-80 bg-[var(--color-bg-card)] rounded-xl
            shadow-[var(--shadow-xl)] border border-[var(--color-border-primary)]
            p-4 animate-mobile-slide-up
          `}
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
          role="dialog"
          aria-labelledby="onboarding-title"
          aria-describedby="onboarding-content"
        >
          {/* Arrow */}
          <div
            className="absolute w-3 h-3 bg-[var(--color-bg-card)] border border-[var(--color-border-primary)] rotate-45"
            style={{
              top: tooltipPosition.arrow === 'top' ? -7 : tooltipPosition.arrow === 'bottom' ? '100%' : '50%',
              left: tooltipPosition.arrow === 'left' ? -7 : tooltipPosition.arrow === 'right' ? '100%' : '50%',
              transform: tooltipPosition.arrow === 'top' || tooltipPosition.arrow === 'bottom'
                ? 'translateX(-50%) rotate(45deg)'
                : 'translateY(-50%) rotate(45deg)',
              borderTop: tooltipPosition.arrow === 'bottom' ? 'none' : undefined,
              borderLeft: tooltipPosition.arrow === 'right' ? 'none' : undefined,
              borderRight: tooltipPosition.arrow === 'left' ? 'none' : undefined,
              borderBottom: tooltipPosition.arrow === 'top' ? 'none' : undefined,
              marginTop: tooltipPosition.arrow === 'bottom' ? '-1px' : undefined,
            }}
          />

          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <h3 id="onboarding-title" className="font-semibold text-[var(--color-text-primary)]">
                {currentStep.title}
              </h3>
              {currentStep.action && (
                <span className="px-2 py-1 rounded bg-[var(--color-bg-secondary)] text-xs font-medium text-[var(--color-text-secondary)]">
                  {currentStep.action.type}
                </span>
              )}
            </div>
            <button
              onClick={exitTour}
              className="p-1 rounded hover:bg-[var(--color-hover-bg)] text-[var(--color-text-secondary)]"
              aria-label="Exit tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] mb-1">
              <span>Step {progress.current} of {progress.total}</span>
              <span>{Math.round(progress.percentage)}%</span>
            </div>
            <div className="w-full bg-[var(--color-bg-secondary)] rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: getThemeVariable('accent-primary'),
                  width: `${progress.percentage}%`,
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div id="onboarding-content" className="mb-4">
            <p className="text-sm text-[var(--color-text-primary)] mb-3">
              {currentStep.content}
            </p>

            {currentStep.action && (
              <div className="p-3 bg-[var(--color-bg-secondary)] rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-[var(--color-accent-primary)] rounded-full" />
                  <span className="text-xs font-medium text-[var(--color-text-primary)]">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {currentStep.action.description}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={previousStep}
                disabled={progress.current <= 1}
                className={`
                  p-2 rounded-lg transition-colors
                  ${progress.current <= 1
                    ? 'text-[var(--color-text-muted)] cursor-not-allowed'
                    : 'text-[var(--color-text-primary)] hover:bg-[var(--color-hover-bg)]'
                  }
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]
                  min-w-touch min-h-touch
                `}
                aria-label="Previous step"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => restartTour()}
                className="p-2 rounded-lg hover:bg-[var(--color-hover-bg)] text-[var(--color-text-secondary)] min-w-touch min-h-touch"
                title="Restart tour"
                aria-label="Restart current tour"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {currentStep.skippable && (
                <button
                  onClick={skipStep}
                  className="px-3 py-1 text-xs rounded-md border border-[var(--color-border-primary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover-bg)]"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {currentStep.action ? (
                <button
                  onClick={handleStepAction}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium
                    bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)]
                    hover:bg-[var(--color-accent-hover)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]
                    min-h-touch
                  `}
                >
                  {currentStep.action.type === 'click' ? 'Click' :
                   currentStep.action.type === 'input' ? 'Focus' :
                   currentStep.action.type === 'hover' ? 'Hover' : 'Continue'}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium
                    bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)]
                    hover:bg-[var(--color-accent-hover)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]
                    min-h-touch flex items-center space-x-1
                  `}
                >
                  <span>{progress.current >= progress.total ? 'Finish' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="mt-3 pt-3 border-t border-[var(--color-border-primary)]">
            <p className="text-xs text-[var(--color-text-muted)]">
              Use ← → to navigate, Ctrl+Space to skip, Esc to exit
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default OnboardingTour;