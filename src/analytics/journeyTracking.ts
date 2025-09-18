/**
 * Participant Journey Tracking Module
 * Tracks card movements and participant behavior during card sorting
 * Routed to: analytics-specialist for temporal pattern analysis
 */

export interface CardMovement {
  cardId: string;
  cardText: string;
  fromCategory: string | null; // null if initial placement
  toCategory: string;
  timestamp: number;
  movementIndex: number; // Order of movement within session
  sessionId: string;
  participantId: string;
}

export interface ParticipantJourney {
  participantId: string;
  sessionId: string;
  startTime: number;
  endTime: number;
  totalDuration: number;
  movements: CardMovement[];
  finalState: { [cardId: string]: string }; // Final category for each card
  statistics: {
    totalMoves: number;
    uniqueCardsMovedCount: number;
    averageMovesPerCard: number;
    undoRedoCount: number;
    hesitationEvents: number; // Cards moved multiple times
    decisionTime: number; // Time between first and last movement
    phases: JourneyPhase[];
  };
}

export interface JourneyPhase {
  phase: 'initial' | 'exploration' | 'refinement' | 'finalization';
  startTime: number;
  endTime: number;
  duration: number;
  movementCount: number;
  cardsAffected: string[];
  description: string;
}

export interface StudyJourneyAnalysis {
  totalParticipants: number;
  averageJourney: {
    duration: number;
    movements: number;
    hesitationRate: number;
    refinementRate: number;
  };
  patterns: {
    commonMovementPatterns: MovementPattern[];
    problematicCards: string[]; // Cards that caused most hesitation
    consensusCards: string[]; // Cards rarely moved after initial placement
    convergenceAnalysis: ConvergencePattern[];
  };
  phaseAnalysis: {
    [phase in JourneyPhase['phase']]: {
      averageDuration: number;
      movementRate: number;
      participantCount: number;
    };
  };
}

export interface MovementPattern {
  pattern: string;
  frequency: number;
  description: string;
  cardIds: string[];
  avgDuration: number;
}

export interface ConvergencePattern {
  cardId: string;
  cardText: string;
  initialVariance: number; // How spread out initial placements were
  finalVariance: number; // How spread out final placements were
  convergenceScore: number; // 0-100, higher = more convergence during sorting
  movementTrajectory: string[]; // Categories the card moved through
}

/**
 * Track a card movement event
 */
export function trackCardMovement(
  cardId: string,
  cardText: string,
  fromCategory: string | null,
  toCategory: string,
  participantId: string,
  sessionId: string,
  movementIndex: number
): CardMovement {
  return {
    cardId,
    cardText,
    fromCategory,
    toCategory,
    timestamp: Date.now(),
    movementIndex,
    sessionId,
    participantId
  };
}

/**
 * Analyze a participant's complete journey
 */
export function analyzeParticipantJourney(movements: CardMovement[], participantId: string): ParticipantJourney {
  if (movements.length === 0) {
    throw new Error('No movements provided for journey analysis');
  }

  const sessionId = movements[0].sessionId;
  const sortedMovements = movements.sort((a, b) => a.movementIndex - b.movementIndex);

  const startTime = Math.min(...sortedMovements.map(m => m.timestamp));
  const endTime = Math.max(...sortedMovements.map(m => m.timestamp));
  const totalDuration = endTime - startTime;

  // Calculate final state
  const finalState: { [cardId: string]: string } = {};
  sortedMovements.forEach(movement => {
    finalState[movement.cardId] = movement.toCategory;
  });

  // Analyze movement patterns
  const cardMovements = new Map<string, CardMovement[]>();
  sortedMovements.forEach(movement => {
    if (!cardMovements.has(movement.cardId)) {
      cardMovements.set(movement.cardId, []);
    }
    cardMovements.get(movement.cardId)!.push(movement);
  });

  const uniqueCardsMovedCount = cardMovements.size;
  const totalMoves = sortedMovements.length;
  const averageMovesPerCard = totalMoves / uniqueCardsMovedCount;

  // Count undo/redo events (cards moved back to previous categories)
  let undoRedoCount = 0;
  cardMovements.forEach(cardMoves => {
    const categories = cardMoves.map(m => m.toCategory);
    for (let i = 1; i < categories.length; i++) {
      if (categories.slice(0, i).includes(categories[i])) {
        undoRedoCount++;
      }
    }
  });

  // Count hesitation events (cards moved more than twice)
  const hesitationEvents = Array.from(cardMovements.values())
    .filter(cardMoves => cardMoves.length > 2).length;

  // Calculate phases
  const phases = calculateJourneyPhases(sortedMovements, startTime, endTime);

  const decisionTime = phases.length > 0 ?
    phases[phases.length - 1].endTime - phases[0].startTime : totalDuration;

  return {
    participantId,
    sessionId,
    startTime,
    endTime,
    totalDuration,
    movements: sortedMovements,
    finalState,
    statistics: {
      totalMoves,
      uniqueCardsMovedCount,
      averageMovesPerCard,
      undoRedoCount,
      hesitationEvents,
      decisionTime,
      phases
    }
  };
}

/**
 * Calculate journey phases based on movement patterns
 */
function calculateJourneyPhases(movements: CardMovement[], startTime: number, endTime: number): JourneyPhase[] {
  if (movements.length === 0) return [];

  const phases: JourneyPhase[] = [];
  const totalDuration = endTime - startTime;
  // const timeWindow = totalDuration / 10; // Analyze in 10% chunks (unused for now)

  // Initial phase: First 20% of time or first burst of activity
  const initialCutoff = startTime + (totalDuration * 0.2);
  const initialMovements = movements.filter(m => m.timestamp <= initialCutoff);

  if (initialMovements.length > 0) {
    phases.push({
      phase: 'initial',
      startTime: startTime,
      endTime: Math.max(...initialMovements.map(m => m.timestamp)),
      duration: Math.max(...initialMovements.map(m => m.timestamp)) - startTime,
      movementCount: initialMovements.length,
      cardsAffected: [...new Set(initialMovements.map(m => m.cardId))],
      description: 'Initial card placement and category exploration'
    });
  }

  // Exploration phase: High movement activity
  const midStart = startTime + (totalDuration * 0.2);
  const midEnd = startTime + (totalDuration * 0.7);
  const explorationMovements = movements.filter(m => m.timestamp > midStart && m.timestamp <= midEnd);

  if (explorationMovements.length > 0) {
    phases.push({
      phase: 'exploration',
      startTime: midStart,
      endTime: midEnd,
      duration: midEnd - midStart,
      movementCount: explorationMovements.length,
      cardsAffected: [...new Set(explorationMovements.map(m => m.cardId))],
      description: 'Active sorting and category development'
    });
  }

  // Refinement phase: Lower activity, fine-tuning
  const refineStart = startTime + (totalDuration * 0.7);
  const refineEnd = startTime + (totalDuration * 0.9);
  const refinementMovements = movements.filter(m => m.timestamp > refineStart && m.timestamp <= refineEnd);

  if (refinementMovements.length > 0) {
    phases.push({
      phase: 'refinement',
      startTime: refineStart,
      endTime: refineEnd,
      duration: refineEnd - refineStart,
      movementCount: refinementMovements.length,
      cardsAffected: [...new Set(refinementMovements.map(m => m.cardId))],
      description: 'Category refinement and optimization'
    });
  }

  // Finalization phase: Last movements
  const finalStart = startTime + (totalDuration * 0.9);
  const finalizationMovements = movements.filter(m => m.timestamp > finalStart);

  if (finalizationMovements.length > 0) {
    phases.push({
      phase: 'finalization',
      startTime: finalStart,
      endTime: endTime,
      duration: endTime - finalStart,
      movementCount: finalizationMovements.length,
      cardsAffected: [...new Set(finalizationMovements.map(m => m.cardId))],
      description: 'Final adjustments and completion'
    });
  }

  return phases;
}

/**
 * Perform comprehensive journey analysis across all participants
 */
export function analyzeStudyJourneys(journeys: ParticipantJourney[]): StudyJourneyAnalysis {
  if (journeys.length === 0) {
    throw new Error('No participant journeys provided');
  }

  const totalParticipants = journeys.length;

  // Calculate averages
  const avgDuration = journeys.reduce((sum, j) => sum + j.totalDuration, 0) / totalParticipants;
  const avgMovements = journeys.reduce((sum, j) => sum + j.statistics.totalMoves, 0) / totalParticipants;
  const avgHesitationRate = journeys.reduce((sum, j) => sum + j.statistics.hesitationEvents, 0) / totalParticipants;
  const avgRefinementRate = journeys.reduce((sum, j) =>
    sum + (j.statistics.undoRedoCount / Math.max(j.statistics.totalMoves, 1)), 0) / totalParticipants;

  // Analyze movement patterns
  const movementPatterns = analyzeMovementPatterns(journeys);

  // Identify problematic cards (high hesitation)
  const cardHesitationMap = new Map<string, number>();
  journeys.forEach(journey => {
    const cardMoves = new Map<string, number>();
    journey.movements.forEach(move => {
      cardMoves.set(move.cardId, (cardMoves.get(move.cardId) || 0) + 1);
    });

    cardMoves.forEach((moves, cardId) => {
      if (moves > 2) { // Card moved more than twice = hesitation
        cardHesitationMap.set(cardId, (cardHesitationMap.get(cardId) || 0) + 1);
      }
    });
  });

  const problematicCards = Array.from(cardHesitationMap.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([cardId]) => cardId);

  // Identify consensus cards (rarely moved)
  const cardMoveFrequency = new Map<string, number>();
  journeys.forEach(journey => {
    const movedCards = new Set(journey.movements.map(m => m.cardId));
    movedCards.forEach(cardId => {
      cardMoveFrequency.set(cardId, (cardMoveFrequency.get(cardId) || 0) + 1);
    });
  });

  const consensusCards = Array.from(cardMoveFrequency.entries())
    .filter(([, frequency]) => frequency < totalParticipants * 0.3) // Moved by less than 30% of participants
    .map(([cardId]) => cardId);

  // Analyze convergence patterns
  const convergenceAnalysis = analyzeConvergencePatterns(journeys);

  // Phase analysis
  const phaseAnalysis = analyzePhases(journeys);

  return {
    totalParticipants,
    averageJourney: {
      duration: avgDuration,
      movements: avgMovements,
      hesitationRate: avgHesitationRate,
      refinementRate: avgRefinementRate
    },
    patterns: {
      commonMovementPatterns: movementPatterns,
      problematicCards,
      consensusCards,
      convergenceAnalysis
    },
    phaseAnalysis
  };
}

/**
 * Analyze common movement patterns across participants
 */
function analyzeMovementPatterns(journeys: ParticipantJourney[]): MovementPattern[] {
  const patterns = new Map<string, {
    count: number,
    cardIds: Set<string>,
    durations: number[]
  }>();

  journeys.forEach(journey => {
    // Group movements by card
    const cardMovements = new Map<string, CardMovement[]>();
    journey.movements.forEach(move => {
      if (!cardMovements.has(move.cardId)) {
        cardMovements.set(move.cardId, []);
      }
      cardMovements.get(move.cardId)!.push(move);
    });

    // Analyze patterns within each card's movements
    cardMovements.forEach((moves, cardId) => {
      if (moves.length >= 2) {
        const trajectory = moves.map(m => m.toCategory).join(' → ');
        const pattern = `${moves.length} moves: ${trajectory}`;

        if (!patterns.has(pattern)) {
          patterns.set(pattern, {
            count: 0,
            cardIds: new Set(),
            durations: []
          });
        }

        const patternData = patterns.get(pattern)!;
        patternData.count++;
        patternData.cardIds.add(cardId);

        if (moves.length > 1) {
          const duration = moves[moves.length - 1].timestamp - moves[0].timestamp;
          patternData.durations.push(duration);
        }
      }
    });
  });

  return Array.from(patterns.entries())
    .filter(([, data]) => data.count >= 2) // Only patterns that occurred at least twice
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10) // Top 10 patterns
    .map(([pattern, data]) => ({
      pattern,
      frequency: data.count,
      description: `Pattern occurred ${data.count} times across ${data.cardIds.size} different cards`,
      cardIds: Array.from(data.cardIds),
      avgDuration: data.durations.length > 0 ?
        data.durations.reduce((sum, d) => sum + d, 0) / data.durations.length : 0
    }));
}

/**
 * Analyze convergence patterns (how card placements converged over time)
 */
function analyzeConvergencePatterns(journeys: ParticipantJourney[]): ConvergencePattern[] {
  const allCards = new Set<string>();
  journeys.forEach(journey => {
    journey.movements.forEach(move => {
      allCards.add(move.cardId);
    });
  });

  return Array.from(allCards).map(cardId => {
    const cardTrajectories: string[][] = [];
    let cardText = cardId;

    journeys.forEach(journey => {
      const cardMoves = journey.movements.filter(m => m.cardId === cardId);
      if (cardMoves.length > 0) {
        cardText = cardMoves[0].cardText;
        const trajectory = cardMoves.map(m => m.toCategory);
        cardTrajectories.push(trajectory);
      }
    });

    // Calculate variance in initial and final placements
    const initialPlacements = cardTrajectories.map(t => t[0]).filter(Boolean);
    const finalPlacements = cardTrajectories.map(t => t[t.length - 1]).filter(Boolean);

    const initialVariance = calculateCategoricalVariance(initialPlacements);
    const finalVariance = calculateCategoricalVariance(finalPlacements);

    const convergenceScore = initialVariance > 0 ?
      Math.max(0, ((initialVariance - finalVariance) / initialVariance) * 100) : 0;

    // Get most common trajectory
    const flatTrajectories = cardTrajectories.flat();
    const movementTrajectory = [...new Set(flatTrajectories)];

    return {
      cardId,
      cardText,
      initialVariance,
      finalVariance,
      convergenceScore,
      movementTrajectory
    };
  }).sort((a, b) => b.convergenceScore - a.convergenceScore);
}

/**
 * Calculate variance for categorical data (categories)
 */
function calculateCategoricalVariance(categories: string[]): number {
  if (categories.length === 0) return 0;

  const frequency = new Map<string, number>();
  categories.forEach(cat => {
    frequency.set(cat, (frequency.get(cat) || 0) + 1);
  });

  const total = categories.length;
  const uniqueCategories = frequency.size;

  // Normalized variance: higher when more spread out across categories
  return uniqueCategories / total;
}

/**
 * Analyze journey phases across all participants
 */
function analyzePhases(journeys: ParticipantJourney[]): StudyJourneyAnalysis['phaseAnalysis'] {
  const phaseData: {
    [K in JourneyPhase['phase']]: { durations: number[]; movements: number[]; count: number }
  } = {
    initial: { durations: [], movements: [], count: 0 },
    exploration: { durations: [], movements: [], count: 0 },
    refinement: { durations: [], movements: [], count: 0 },
    finalization: { durations: [], movements: [], count: 0 }
  };

  journeys.forEach(journey => {
    journey.statistics.phases.forEach(phase => {
      const data = phaseData[phase.phase];
      data.durations.push(phase.duration);
      data.movements.push(phase.movementCount);
      data.count++;
    });
  });

  const result = {
    initial: { averageDuration: 0, movementRate: 0, participantCount: 0 },
    exploration: { averageDuration: 0, movementRate: 0, participantCount: 0 },
    refinement: { averageDuration: 0, movementRate: 0, participantCount: 0 },
    finalization: { averageDuration: 0, movementRate: 0, participantCount: 0 }
  };

  // Manually assign each phase to avoid TypeScript Object.entries issues
  if (phaseData.initial.count > 0) {
    result.initial = {
      averageDuration: phaseData.initial.durations.reduce((sum, d) => sum + d, 0) / phaseData.initial.durations.length,
      movementRate: phaseData.initial.movements.reduce((sum, m) => sum + m, 0) / phaseData.initial.movements.length,
      participantCount: phaseData.initial.count
    };
  }

  if (phaseData.exploration.count > 0) {
    result.exploration = {
      averageDuration: phaseData.exploration.durations.reduce((sum, d) => sum + d, 0) / phaseData.exploration.durations.length,
      movementRate: phaseData.exploration.movements.reduce((sum, m) => sum + m, 0) / phaseData.exploration.movements.length,
      participantCount: phaseData.exploration.count
    };
  }

  if (phaseData.refinement.count > 0) {
    result.refinement = {
      averageDuration: phaseData.refinement.durations.reduce((sum, d) => sum + d, 0) / phaseData.refinement.durations.length,
      movementRate: phaseData.refinement.movements.reduce((sum, m) => sum + m, 0) / phaseData.refinement.movements.length,
      participantCount: phaseData.refinement.count
    };
  }

  if (phaseData.finalization.count > 0) {
    result.finalization = {
      averageDuration: phaseData.finalization.durations.reduce((sum, d) => sum + d, 0) / phaseData.finalization.durations.length,
      movementRate: phaseData.finalization.movements.reduce((sum, m) => sum + m, 0) / phaseData.finalization.movements.length,
      participantCount: phaseData.finalization.count
    };
  }

  return result;
}

/**
 * Create journey tracking system for real-time use during card sorting
 */
export class JourneyTracker {
  private movements: CardMovement[] = [];
  private sessionId: string;
  private participantId: string;
  private movementIndex = 0;

  constructor(participantId: string, sessionId?: string) {
    this.participantId = participantId;
    this.sessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Track a card movement
   */
  trackMovement(cardId: string, cardText: string, fromCategory: string | null, toCategory: string): CardMovement {
    const movement = trackCardMovement(
      cardId,
      cardText,
      fromCategory,
      toCategory,
      this.participantId,
      this.sessionId,
      this.movementIndex++
    );

    this.movements.push(movement);
    return movement;
  }

  /**
   * Get current movements
   */
  getMovements(): CardMovement[] {
    return [...this.movements];
  }

  /**
   * Get complete journey analysis
   */
  getJourney(): ParticipantJourney {
    return analyzeParticipantJourney(this.movements, this.participantId);
  }

  /**
   * Reset tracking (for new session)
   */
  reset(): void {
    this.movements = [];
    this.movementIndex = 0;
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Export journey data for persistence
   */
  exportData(): {
    participantId: string;
    sessionId: string;
    movements: CardMovement[];
    timestamp: number;
  } {
    return {
      participantId: this.participantId,
      sessionId: this.sessionId,
      movements: this.movements,
      timestamp: Date.now()
    };
  }
}