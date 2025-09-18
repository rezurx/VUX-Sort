/**
 * Agreement Scores Analytics Module
 * Implements per-card/category agreement analysis based on orchestrator recommendations
 * Routed to: analytics-specialist with statistical analysis focus
 */

import { StudyResult, CardSortResult } from '../types';

export interface CardAgreementScore {
  cardId: string;
  cardText: string;
  agreementScore: number; // 0-100 percentage
  consensusCategory: string;
  categoryAgreementPercentage: number;
  placementFrequency: { [categoryName: string]: number };
  totalParticipants: number;
  uniquePlacements: number;
}

export interface CategoryAgreementScore {
  categoryName: string;
  agreementScore: number; // 0-100 percentage
  cardCount: number;
  usageFrequency: number; // How many participants used this category
  usagePercentage: number;
  cardsInCategory: string[];
  consensusCards: string[]; // Cards that most participants put in this category
}

export interface StudyAgreementAnalysis {
  overallAgreementScore: number;
  cardAgreements: CardAgreementScore[];
  categoryAgreements: CategoryAgreementScore[];
  agreementMatrix: number[][]; // Card-to-card agreement matrix
  dendrogramData: any; // Hierarchical clustering data
  insights: {
    highestAgreementCard: CardAgreementScore;
    lowestAgreementCard: CardAgreementScore;
    mostConsensusCategory: CategoryAgreementScore;
    leastConsensusCategory: CategoryAgreementScore;
    averageAgreementScore: number;
    agreementDistribution: { [range: string]: number };
  };
}

/**
 * Calculate agreement scores for cards across all participants
 */
export function calculateCardAgreementScores(results: CardSortResult[]): CardAgreementScore[] {
  if (results.length === 0) return [];

  const cardPlacements = new Map<string, Map<string, number>>();
  const totalParticipants = results.length;

  // Collect all card placements across participants
  results.forEach(result => {
    result.cardSortResults.forEach(category => {
      category.cards.forEach(card => {
        const cardIdStr = String(card.id);
        if (!cardPlacements.has(cardIdStr)) {
          cardPlacements.set(cardIdStr, new Map());
        }

        const cardMap = cardPlacements.get(cardIdStr)!;
        const currentCount = cardMap.get(category.categoryName) || 0;
        cardMap.set(category.categoryName, currentCount + 1);
      });
    });
  });

  // Calculate agreement scores for each card
  const cardAgreements: CardAgreementScore[] = [];

  cardPlacements.forEach((placements, cardId) => {
    const placementArray = Array.from(placements.entries());
    const maxPlacement = placementArray.reduce((max, [category, count]) =>
      count > max.count ? { category, count } : max,
      { category: '', count: 0 }
    );

    const agreementScore = (maxPlacement.count / totalParticipants) * 100;
    const placementFrequency: { [categoryName: string]: number } = {};

    placements.forEach((count, category) => {
      placementFrequency[category] = count;
    });

    // Get card text from first occurrence
    let cardText = cardId;
    for (const result of results) {
      for (const category of result.cardSortResults) {
        const card = category.cards.find(c => String(c.id) === cardId);
        if (card) {
          cardText = card.text;
          break;
        }
      }
      if (cardText !== cardId) break;
    }

    cardAgreements.push({
      cardId,
      cardText,
      agreementScore,
      consensusCategory: maxPlacement.category,
      categoryAgreementPercentage: agreementScore,
      placementFrequency,
      totalParticipants,
      uniquePlacements: placements.size
    });
  });

  return cardAgreements.sort((a, b) => b.agreementScore - a.agreementScore);
}

/**
 * Calculate agreement scores for categories
 */
export function calculateCategoryAgreementScores(results: CardSortResult[]): CategoryAgreementScore[] {
  if (results.length === 0) return [];

  const categoryUsage = new Map<string, {
    users: Set<string>,
    cards: Set<string>,
    cardFrequency: Map<string, number>
  }>();

  const totalParticipants = results.length;

  // Collect category usage data
  results.forEach(result => {
    result.cardSortResults.forEach(category => {
      if (!categoryUsage.has(category.categoryName)) {
        categoryUsage.set(category.categoryName, {
          users: new Set(),
          cards: new Set(),
          cardFrequency: new Map()
        });
      }

      const data = categoryUsage.get(category.categoryName)!;
      data.users.add(result.participantId);

      category.cards.forEach(card => {
        const cardIdStr = String(card.id);
        data.cards.add(cardIdStr);
        const currentCount = data.cardFrequency.get(cardIdStr) || 0;
        data.cardFrequency.set(cardIdStr, currentCount + 1);
      });
    });
  });

  // Calculate category agreement scores
  const categoryAgreements: CategoryAgreementScore[] = [];

  categoryUsage.forEach((data, categoryName) => {
    const usageFrequency = data.users.size;
    const usagePercentage = (usageFrequency / totalParticipants) * 100;

    // Calculate agreement score based on consistent card placements
    const cardConsistency = Array.from(data.cardFrequency.entries())
      .map(([, frequency]) => frequency / usageFrequency)
      .reduce((sum, consistency) => sum + consistency, 0) / data.cards.size;

    const agreementScore = (cardConsistency * usagePercentage) / 100 * 100;

    // Find consensus cards (cards that appear in this category for majority of users)
    const consensusCards = Array.from(data.cardFrequency.entries())
      .filter(([, frequency]) => frequency >= Math.ceil(usageFrequency / 2))
      .map(([cardIdStr]) => cardIdStr);

    categoryAgreements.push({
      categoryName,
      agreementScore,
      cardCount: data.cards.size,
      usageFrequency,
      usagePercentage,
      cardsInCategory: Array.from(data.cards),
      consensusCards
    });
  });

  return categoryAgreements.sort((a, b) => b.agreementScore - a.agreementScore);
}

/**
 * Generate card-to-card agreement matrix
 */
export function generateAgreementMatrix(results: CardSortResult[]): {
  matrix: number[][],
  cardIds: string[],
  cardLabels: string[]
} {
  if (results.length === 0) return { matrix: [], cardIds: [], cardLabels: [] };

  // Get all unique cards
  const cardSet = new Set<string>();
  const cardIdToText = new Map<string, string>();

  results.forEach(result => {
    result.cardSortResults.forEach(category => {
      category.cards.forEach(card => {
        const cardIdStr = String(card.id);
        cardSet.add(cardIdStr);
        cardIdToText.set(cardIdStr, card.text);
      });
    });
  });

  const cardIds = Array.from(cardSet);
  const cardLabels = cardIds.map(id => cardIdToText.get(id) || id);
  const size = cardIds.length;
  const matrix: number[][] = Array(size).fill(null).map(() => Array(size).fill(0));

  // Calculate agreement between each pair of cards
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (i === j) {
        matrix[i][j] = 100; // Perfect agreement with itself
        continue;
      }

      let sameGroupCount = 0;
      const cardA = cardIds[i];
      const cardB = cardIds[j];

      results.forEach(result => {
        let categoryA = '';
        let categoryB = '';

        // Find which categories these cards are in for this participant
        result.cardSortResults.forEach(category => {
          if (category.cards.some(card => String(card.id) === cardA)) {
            categoryA = category.categoryName;
          }
          if (category.cards.some(card => String(card.id) === cardB)) {
            categoryB = category.categoryName;
          }
        });

        if (categoryA && categoryB && categoryA === categoryB) {
          sameGroupCount++;
        }
      });

      matrix[i][j] = (sameGroupCount / results.length) * 100;
    }
  }

  return { matrix, cardIds, cardLabels };
}

/**
 * Perform complete agreement analysis for a study
 */
export function performAgreementAnalysis(results: StudyResult[]): StudyAgreementAnalysis {
  const cardSortResults = results.filter(r =>
    ['card-sorting', 'open-card-sorting', 'reverse-card-sorting'].includes(r.studyType)
  ) as CardSortResult[];

  if (cardSortResults.length === 0) {
    throw new Error('No card sorting results found for agreement analysis');
  }

  const cardAgreements = calculateCardAgreementScores(cardSortResults);
  const categoryAgreements = calculateCategoryAgreementScores(cardSortResults);
  const { matrix: agreementMatrix } = generateAgreementMatrix(cardSortResults);

  // Calculate overall agreement score
  const totalAgreement = cardAgreements.reduce((sum, card) => sum + card.agreementScore, 0);
  const overallAgreementScore = cardAgreements.length > 0 ? totalAgreement / cardAgreements.length : 0;

  // Generate insights
  const sortedCardAgreements = [...cardAgreements].sort((a, b) => b.agreementScore - a.agreementScore);
  const sortedCategoryAgreements = [...categoryAgreements].sort((a, b) => b.agreementScore - a.agreementScore);

  const agreementDistribution: { [range: string]: number } = {
    '90-100%': 0,
    '80-89%': 0,
    '70-79%': 0,
    '60-69%': 0,
    '50-59%': 0,
    'Below 50%': 0
  };

  cardAgreements.forEach(card => {
    const score = card.agreementScore;
    if (score >= 90) agreementDistribution['90-100%']++;
    else if (score >= 80) agreementDistribution['80-89%']++;
    else if (score >= 70) agreementDistribution['70-79%']++;
    else if (score >= 60) agreementDistribution['60-69%']++;
    else if (score >= 50) agreementDistribution['50-59%']++;
    else agreementDistribution['Below 50%']++;
  });

  return {
    overallAgreementScore,
    cardAgreements,
    categoryAgreements,
    agreementMatrix,
    dendrogramData: null, // Will be generated separately with D3.js
    insights: {
      highestAgreementCard: sortedCardAgreements[0] || null,
      lowestAgreementCard: sortedCardAgreements[sortedCardAgreements.length - 1] || null,
      mostConsensusCategory: sortedCategoryAgreements[0] || null,
      leastConsensusCategory: sortedCategoryAgreements[sortedCategoryAgreements.length - 1] || null,
      averageAgreementScore: overallAgreementScore,
      agreementDistribution
    }
  };
}

/**
 * Generate agreement score heatmap data for visualization
 */
export interface HeatmapData {
  cardPairs: { cardA: string; cardB: string; score: number; cardAText: string; cardBText: string }[];
  maxScore: number;
  minScore: number;
}

export function generateAgreementHeatmapData(results: CardSortResult[]): HeatmapData {
  const { matrix, cardIds, cardLabels } = generateAgreementMatrix(results);
  const cardPairs: HeatmapData['cardPairs'] = [];

  let maxScore = 0;
  let minScore = 100;

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      const score = matrix[i][j];
      cardPairs.push({
        cardA: cardIds[i],
        cardB: cardIds[j],
        score,
        cardAText: cardLabels[i],
        cardBText: cardLabels[j]
      });

      if (i !== j) { // Exclude diagonal (self-agreement)
        maxScore = Math.max(maxScore, score);
        minScore = Math.min(minScore, score);
      }
    }
  }

  return { cardPairs, maxScore, minScore };
}