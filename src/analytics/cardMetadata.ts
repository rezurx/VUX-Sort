/**
 * Card Metadata and Tagging System
 * Tracks card metadata across studies for cross-study analytics
 * Routed to: analytics-specialist for cross-study tracking and data modeling
 */

export interface CardMetadata {
  cardId: string;
  cardText: string;
  tags: CardTag[];
  properties: { [key: string]: any };
  crossStudyHistory: CrossStudyEntry[];
  analytics: CardAnalytics;
  created: number;
  lastModified: number;
}

export interface CardTag {
  id: string;
  name: string;
  category: TagCategory;
  color?: string;
  description?: string;
  created: number;
  createdBy: string;
}

export type TagCategory =
  | 'content-type'     // image, text, video, etc.
  | 'domain'          // finance, healthcare, technology, etc.
  | 'complexity'      // simple, moderate, complex
  | 'behavior'        // high-agreement, controversial, consensus
  | 'semantic'        // action, object, concept, etc.
  | 'methodology'     // pilot, validation, iteration
  | 'custom';         // user-defined

export interface CrossStudyEntry {
  studyId: string;
  studyName: string;
  studyType: string;
  participantCount: number;
  averageAgreementScore: number;
  mostCommonCategory: string;
  categoryFrequency: { [category: string]: number };
  dateCompleted: number;
  notes?: string;
}

export interface CardAnalytics {
  totalStudies: number;
  totalParticipants: number;
  averageAgreementScore: number;
  agreementTrend: number; // Positive = improving, negative = declining
  categoryStability: number; // 0-100, how consistent category placements are
  problematicScore: number; // 0-100, how often this card causes hesitation
  consensusScore: number; // 0-100, how often participants agree
  semanticClusters: string[]; // Cards frequently grouped with this one
  performanceMetrics: {
    highestAgreementStudy: string;
    lowestAgreementStudy: string;
    mostFrequentCategory: string;
    volatilityIndex: number;
  };
}

export interface TaggingSystem {
  tags: Map<string, CardTag>;
  cardMetadata: Map<string, CardMetadata>;
  tagCategories: Map<TagCategory, TagCategoryInfo>;
  searchIndex: SearchIndex;
}

export interface TagCategoryInfo {
  category: TagCategory;
  name: string;
  description: string;
  defaultColor: string;
  predefinedTags: string[];
  allowCustomTags: boolean;
}

export interface SearchIndex {
  byTag: Map<string, Set<string>>; // tag name -> card IDs
  byCategory: Map<TagCategory, Set<string>>; // tag category -> card IDs
  byProperty: Map<string, Map<any, Set<string>>>; // property -> value -> card IDs
  byAgreementRange: Map<string, Set<string>>; // range -> card IDs
  textSearch: Map<string, Set<string>>; // search terms -> card IDs
}

export interface CrossStudyAnalysis {
  cardId: string;
  cardText: string;
  studyComparison: StudyComparison[];
  trends: {
    agreementTrend: TrendAnalysis;
    categoryStabilityTrend: TrendAnalysis;
    participationTrend: TrendAnalysis;
  };
  insights: {
    mostStableCategory: string;
    emergingCategories: string[];
    decliningCategories: string[];
    consistencyScore: number;
    evolutionPattern: 'stable' | 'improving' | 'declining' | 'volatile';
  };
}

export interface StudyComparison {
  studyId: string;
  studyName: string;
  agreementScore: number;
  primaryCategory: string;
  participantCount: number;
  date: number;
  deviation: number; // How much this study deviates from average
}

export interface TrendAnalysis {
  direction: 'up' | 'down' | 'stable';
  magnitude: number; // 0-1, strength of trend
  confidence: number; // 0-1, confidence in trend
  dataPoints: { value: number; date: number }[];
}

/**
 * Create default tag categories
 */
export function createDefaultTagCategories(): Map<TagCategory, TagCategoryInfo> {
  const categories = new Map<TagCategory, TagCategoryInfo>();

  categories.set('content-type', {
    category: 'content-type',
    name: 'Content Type',
    description: 'Type of content or media',
    defaultColor: '#3B82F6',
    predefinedTags: ['text', 'image', 'video', 'audio', 'interactive', 'document', 'link'],
    allowCustomTags: true
  });

  categories.set('domain', {
    category: 'domain',
    name: 'Domain',
    description: 'Subject matter or industry domain',
    defaultColor: '#10B981',
    predefinedTags: ['healthcare', 'finance', 'education', 'technology', 'retail', 'government', 'entertainment'],
    allowCustomTags: true
  });

  categories.set('complexity', {
    category: 'complexity',
    name: 'Complexity',
    description: 'Cognitive complexity or difficulty level',
    defaultColor: '#F59E0B',
    predefinedTags: ['simple', 'moderate', 'complex', 'expert'],
    allowCustomTags: false
  });

  categories.set('behavior', {
    category: 'behavior',
    name: 'Behavior',
    description: 'How participants typically interact with this card',
    defaultColor: '#EF4444',
    predefinedTags: ['high-agreement', 'controversial', 'consensus', 'problematic', 'intuitive'],
    allowCustomTags: true
  });

  categories.set('semantic', {
    category: 'semantic',
    name: 'Semantic',
    description: 'Semantic or grammatical classification',
    defaultColor: '#8B5CF6',
    predefinedTags: ['action', 'object', 'concept', 'process', 'attribute', 'relationship'],
    allowCustomTags: true
  });

  categories.set('methodology', {
    category: 'methodology',
    name: 'Methodology',
    description: 'Research methodology or study purpose',
    defaultColor: '#06B6D4',
    predefinedTags: ['pilot', 'validation', 'iteration', 'baseline', 'comparison', 'experimental'],
    allowCustomTags: true
  });

  categories.set('custom', {
    category: 'custom',
    name: 'Custom',
    description: 'User-defined tags',
    defaultColor: '#6B7280',
    predefinedTags: [],
    allowCustomTags: true
  });

  return categories;
}

/**
 * Create a new tagging system
 */
export function createTaggingSystem(): TaggingSystem {
  return {
    tags: new Map(),
    cardMetadata: new Map(),
    tagCategories: createDefaultTagCategories(),
    searchIndex: {
      byTag: new Map(),
      byCategory: new Map(),
      byProperty: new Map(),
      byAgreementRange: new Map(),
      textSearch: new Map()
    }
  };
}

/**
 * Create a new card tag
 */
export function createCardTag(
  name: string,
  category: TagCategory,
  createdBy: string,
  description?: string,
  color?: string
): CardTag {
  return {
    id: `tag_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    name: name.toLowerCase().trim(),
    category,
    color,
    description,
    created: Date.now(),
    createdBy
  };
}

/**
 * Add a tag to the system
 */
export function addTag(system: TaggingSystem, tag: CardTag): void {
  system.tags.set(tag.id, tag);

  // Update search index
  if (!system.searchIndex.byTag.has(tag.name)) {
    system.searchIndex.byTag.set(tag.name, new Set());
  }

  if (!system.searchIndex.byCategory.has(tag.category)) {
    system.searchIndex.byCategory.set(tag.category, new Set());
  }
}

/**
 * Create card metadata
 */
export function createCardMetadata(
  cardId: string,
  cardText: string,
  tags: CardTag[] = [],
  properties: { [key: string]: any } = {}
): CardMetadata {
  return {
    cardId,
    cardText,
    tags,
    properties,
    crossStudyHistory: [],
    analytics: {
      totalStudies: 0,
      totalParticipants: 0,
      averageAgreementScore: 0,
      agreementTrend: 0,
      categoryStability: 0,
      problematicScore: 0,
      consensusScore: 0,
      semanticClusters: [],
      performanceMetrics: {
        highestAgreementStudy: '',
        lowestAgreementStudy: '',
        mostFrequentCategory: '',
        volatilityIndex: 0
      }
    },
    created: Date.now(),
    lastModified: Date.now()
  };
}

/**
 * Add card metadata to the system
 */
export function addCardMetadata(system: TaggingSystem, metadata: CardMetadata): void {
  system.cardMetadata.set(metadata.cardId, metadata);
  updateSearchIndex(system, metadata);
}

/**
 * Update search index for a card
 */
function updateSearchIndex(system: TaggingSystem, metadata: CardMetadata): void {
  const cardId = metadata.cardId;

  // Index by tags
  metadata.tags.forEach(tag => {
    if (!system.searchIndex.byTag.has(tag.name)) {
      system.searchIndex.byTag.set(tag.name, new Set());
    }
    system.searchIndex.byTag.get(tag.name)!.add(cardId);

    if (!system.searchIndex.byCategory.has(tag.category)) {
      system.searchIndex.byCategory.set(tag.category, new Set());
    }
    system.searchIndex.byCategory.get(tag.category)!.add(cardId);
  });

  // Index by properties
  Object.entries(metadata.properties).forEach(([key, value]) => {
    if (!system.searchIndex.byProperty.has(key)) {
      system.searchIndex.byProperty.set(key, new Map());
    }
    const propertyMap = system.searchIndex.byProperty.get(key)!;
    if (!propertyMap.has(value)) {
      propertyMap.set(value, new Set());
    }
    propertyMap.get(value)!.add(cardId);
  });

  // Index by agreement score range
  const agreementScore = metadata.analytics.averageAgreementScore;
  const range = getAgreementRange(agreementScore);
  if (!system.searchIndex.byAgreementRange.has(range)) {
    system.searchIndex.byAgreementRange.set(range, new Set());
  }
  system.searchIndex.byAgreementRange.get(range)!.add(cardId);

  // Index by text content
  const searchTerms = metadata.cardText.toLowerCase().split(/\s+/);
  searchTerms.forEach(term => {
    if (term.length > 2) { // Only index meaningful terms
      if (!system.searchIndex.textSearch.has(term)) {
        system.searchIndex.textSearch.set(term, new Set());
      }
      system.searchIndex.textSearch.get(term)!.add(cardId);
    }
  });
}

/**
 * Get agreement range for indexing
 */
function getAgreementRange(score: number): string {
  if (score >= 90) return '90-100';
  if (score >= 80) return '80-89';
  if (score >= 70) return '70-79';
  if (score >= 60) return '60-69';
  if (score >= 50) return '50-59';
  return '0-49';
}

/**
 * Tag a card with multiple tags
 */
export function tagCard(
  system: TaggingSystem,
  cardId: string,
  cardText: string,
  tagNames: string[],
  properties: { [key: string]: any } = {}
): CardMetadata {
  let metadata = system.cardMetadata.get(cardId);

  if (!metadata) {
    metadata = createCardMetadata(cardId, cardText, [], properties);
  }

  // Add new tags
  tagNames.forEach(tagName => {
    const normalizedName = tagName.toLowerCase().trim();
    const existingTag = Array.from(system.tags.values()).find(t => t.name === normalizedName);

    if (existingTag && !metadata!.tags.find(t => t.id === existingTag.id)) {
      metadata!.tags.push(existingTag);
    }
  });

  // Update properties
  metadata.properties = { ...metadata.properties, ...properties };
  metadata.lastModified = Date.now();

  // Update system
  addCardMetadata(system, metadata);

  return metadata;
}

/**
 * Update card analytics from study results
 */
export function updateCardAnalytics(
  system: TaggingSystem,
  cardId: string,
  studyResults: {
    studyId: string;
    studyName: string;
    studyType: string;
    participantCount: number;
    agreementScore: number;
    primaryCategory: string;
    categoryFrequency: { [category: string]: number };
    problematicScore?: number;
  }
): void {
  let metadata = system.cardMetadata.get(cardId);
  if (!metadata) return;

  // Add to cross-study history
  const crossStudyEntry: CrossStudyEntry = {
    studyId: studyResults.studyId,
    studyName: studyResults.studyName,
    studyType: studyResults.studyType,
    participantCount: studyResults.participantCount,
    averageAgreementScore: studyResults.agreementScore,
    mostCommonCategory: studyResults.primaryCategory,
    categoryFrequency: studyResults.categoryFrequency,
    dateCompleted: Date.now()
  };

  metadata.crossStudyHistory.push(crossStudyEntry);

  // Recalculate analytics
  const analytics = metadata.analytics;
  analytics.totalStudies = metadata.crossStudyHistory.length;
  analytics.totalParticipants = metadata.crossStudyHistory.reduce(
    (sum, entry) => sum + entry.participantCount, 0
  );

  // Calculate average agreement score
  analytics.averageAgreementScore = metadata.crossStudyHistory.reduce(
    (sum, entry) => sum + entry.averageAgreementScore, 0
  ) / analytics.totalStudies;

  // Calculate agreement trend
  if (metadata.crossStudyHistory.length >= 2) {
    const recent = metadata.crossStudyHistory.slice(-3);
    const older = metadata.crossStudyHistory.slice(0, -3);

    if (older.length > 0) {
      const recentAvg = recent.reduce((sum, entry) => sum + entry.averageAgreementScore, 0) / recent.length;
      const olderAvg = older.reduce((sum, entry) => sum + entry.averageAgreementScore, 0) / older.length;
      analytics.agreementTrend = recentAvg - olderAvg;
    }
  }

  // Calculate category stability
  const categories = metadata.crossStudyHistory.map(entry => entry.mostCommonCategory);
  const categoryFreq = new Map<string, number>();
  categories.forEach(cat => {
    categoryFreq.set(cat, (categoryFreq.get(cat) || 0) + 1);
  });

  const maxFreq = Math.max(...Array.from(categoryFreq.values()));
  analytics.categoryStability = (maxFreq / categories.length) * 100;

  // Update performance metrics
  const sortedByAgreement = [...metadata.crossStudyHistory].sort(
    (a, b) => b.averageAgreementScore - a.averageAgreementScore
  );

  analytics.performanceMetrics.highestAgreementStudy = sortedByAgreement[0]?.studyId || '';
  analytics.performanceMetrics.lowestAgreementStudy = sortedByAgreement[sortedByAgreement.length - 1]?.studyId || '';

  const mostFrequentCategory = Array.from(categoryFreq.entries())
    .sort(([,a], [,b]) => b - a)[0];
  analytics.performanceMetrics.mostFrequentCategory = mostFrequentCategory ? mostFrequentCategory[0] : '';

  // Calculate volatility index (variance in agreement scores)
  const scores = metadata.crossStudyHistory.map(entry => entry.averageAgreementScore);
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  analytics.performanceMetrics.volatilityIndex = Math.sqrt(variance);

  // Update problematic and consensus scores
  if (studyResults.problematicScore !== undefined) {
    analytics.problematicScore = studyResults.problematicScore;
  }
  analytics.consensusScore = analytics.categoryStability;

  metadata.lastModified = Date.now();
  updateSearchIndex(system, metadata);
}

/**
 * Search cards by criteria
 */
export interface CardSearchCriteria {
  tags?: string[];
  tagCategories?: TagCategory[];
  properties?: { [key: string]: any };
  agreementRange?: string;
  textSearch?: string;
  studyCount?: { min?: number; max?: number };
  agreementScore?: { min?: number; max?: number };
}

export function searchCards(system: TaggingSystem, criteria: CardSearchCriteria): CardMetadata[] {
  let resultIds = new Set<string>();
  let firstFilter = true;

  // Filter by tags
  if (criteria.tags && criteria.tags.length > 0) {
    const tagResults = new Set<string>();
    criteria.tags.forEach(tagName => {
      const cardIds = system.searchIndex.byTag.get(tagName.toLowerCase());
      if (cardIds) {
        cardIds.forEach(id => tagResults.add(id));
      }
    });

    if (firstFilter) {
      resultIds = tagResults;
      firstFilter = false;
    } else {
      resultIds = new Set([...resultIds].filter(id => tagResults.has(id)));
    }
  }

  // Filter by tag categories
  if (criteria.tagCategories && criteria.tagCategories.length > 0) {
    const categoryResults = new Set<string>();
    criteria.tagCategories.forEach(category => {
      const cardIds = system.searchIndex.byCategory.get(category);
      if (cardIds) {
        cardIds.forEach(id => categoryResults.add(id));
      }
    });

    if (firstFilter) {
      resultIds = categoryResults;
      firstFilter = false;
    } else {
      resultIds = new Set([...resultIds].filter(id => categoryResults.has(id)));
    }
  }

  // Filter by text search
  if (criteria.textSearch) {
    const textResults = new Set<string>();
    const searchTerms = criteria.textSearch.toLowerCase().split(/\s+/);

    searchTerms.forEach(term => {
      const cardIds = system.searchIndex.textSearch.get(term);
      if (cardIds) {
        cardIds.forEach(id => textResults.add(id));
      }
    });

    if (firstFilter) {
      resultIds = textResults;
      firstFilter = false;
    } else {
      resultIds = new Set([...resultIds].filter(id => textResults.has(id)));
    }
  }

  // If no filters applied, start with all cards
  if (firstFilter) {
    resultIds = new Set(system.cardMetadata.keys());
  }

  // Apply additional filters
  const results = Array.from(resultIds)
    .map(id => system.cardMetadata.get(id)!)
    .filter(metadata => {
      // Filter by properties
      if (criteria.properties) {
        for (const [key, value] of Object.entries(criteria.properties)) {
          if (metadata.properties[key] !== value) {
            return false;
          }
        }
      }

      // Filter by study count
      if (criteria.studyCount) {
        const studyCount = metadata.analytics.totalStudies;
        if (criteria.studyCount.min !== undefined && studyCount < criteria.studyCount.min) {
          return false;
        }
        if (criteria.studyCount.max !== undefined && studyCount > criteria.studyCount.max) {
          return false;
        }
      }

      // Filter by agreement score
      if (criteria.agreementScore) {
        const score = metadata.analytics.averageAgreementScore;
        if (criteria.agreementScore.min !== undefined && score < criteria.agreementScore.min) {
          return false;
        }
        if (criteria.agreementScore.max !== undefined && score > criteria.agreementScore.max) {
          return false;
        }
      }

      return true;
    });

  return results;
}

/**
 * Perform cross-study analysis for a specific card
 */
export function performCrossStudyAnalysis(system: TaggingSystem, cardId: string): CrossStudyAnalysis | null {
  const metadata = system.cardMetadata.get(cardId);
  if (!metadata || metadata.crossStudyHistory.length < 2) {
    return null;
  }

  const history = metadata.crossStudyHistory.sort((a, b) => a.dateCompleted - b.dateCompleted);

  // Calculate trends
  const agreementTrend = calculateTrend(history.map(h => ({
    value: h.averageAgreementScore,
    date: h.dateCompleted
  })));

  const categoryStabilityData = history.map((entry, index) => {
    const upToIndex = history.slice(0, index + 1);
    const categories = upToIndex.map(h => h.mostCommonCategory);
    const categoryFreq = new Map<string, number>();
    categories.forEach(cat => {
      categoryFreq.set(cat, (categoryFreq.get(cat) || 0) + 1);
    });
    const maxFreq = Math.max(...Array.from(categoryFreq.values()));
    const stability = (maxFreq / categories.length) * 100;

    return { value: stability, date: entry.dateCompleted };
  });

  const categoryStabilityTrend = calculateTrend(categoryStabilityData);

  const participationTrend = calculateTrend(history.map(h => ({
    value: h.participantCount,
    date: h.dateCompleted
  })));

  // Analyze category patterns
  const categoryFreq = new Map<string, number>();
  history.forEach(entry => {
    categoryFreq.set(entry.mostCommonCategory, (categoryFreq.get(entry.mostCommonCategory) || 0) + 1);
  });

  const sortedCategories = Array.from(categoryFreq.entries()).sort(([,a], [,b]) => b - a);
  const mostStableCategory = sortedCategories[0]?.[0] || '';

  // Identify emerging and declining categories
  const recentHistory = history.slice(-Math.ceil(history.length / 2));
  const olderHistory = history.slice(0, Math.floor(history.length / 2));

  const recentCategories = new Set(recentHistory.map(h => h.mostCommonCategory));
  const olderCategories = new Set(olderHistory.map(h => h.mostCommonCategory));

  const emergingCategories = Array.from(recentCategories).filter(cat => !olderCategories.has(cat));
  const decliningCategories = Array.from(olderCategories).filter(cat => !recentCategories.has(cat));

  // Calculate consistency score
  const consistencyScore = metadata.analytics.categoryStability;

  // Determine evolution pattern
  let evolutionPattern: 'stable' | 'improving' | 'declining' | 'volatile';
  if (metadata.analytics.performanceMetrics.volatilityIndex > 20) {
    evolutionPattern = 'volatile';
  } else if (agreementTrend.direction === 'up' && agreementTrend.magnitude > 0.3) {
    evolutionPattern = 'improving';
  } else if (agreementTrend.direction === 'down' && agreementTrend.magnitude > 0.3) {
    evolutionPattern = 'declining';
  } else {
    evolutionPattern = 'stable';
  }

  return {
    cardId,
    cardText: metadata.cardText,
    studyComparison: history.map(entry => ({
      studyId: entry.studyId,
      studyName: entry.studyName,
      agreementScore: entry.averageAgreementScore,
      primaryCategory: entry.mostCommonCategory,
      participantCount: entry.participantCount,
      date: entry.dateCompleted,
      deviation: Math.abs(entry.averageAgreementScore - metadata.analytics.averageAgreementScore)
    })),
    trends: {
      agreementTrend,
      categoryStabilityTrend,
      participationTrend
    },
    insights: {
      mostStableCategory,
      emergingCategories,
      decliningCategories,
      consistencyScore,
      evolutionPattern
    }
  };
}

/**
 * Calculate trend analysis from data points
 */
function calculateTrend(dataPoints: { value: number; date: number }[]): TrendAnalysis {
  if (dataPoints.length < 2) {
    return {
      direction: 'stable',
      magnitude: 0,
      confidence: 0,
      dataPoints
    };
  }

  // Simple linear regression to determine trend
  const n = dataPoints.length;
  const sumX = dataPoints.reduce((sum, _point, index) => sum + index, 0);
  const sumY = dataPoints.reduce((sum, point) => sum + point.value, 0);
  const sumXY = dataPoints.reduce((sum, point, index) => sum + (index * point.value), 0);
  const sumXX = dataPoints.reduce((sum, _point, index) => sum + (index * index), 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate correlation coefficient for confidence
  const meanY = sumY / n;
  const totalVariation = dataPoints.reduce((sum, point) => sum + Math.pow(point.value - meanY, 2), 0);
  const explainedVariation = dataPoints.reduce((sum, _point, index) => {
    const predicted = slope * index + intercept;
    return sum + Math.pow(predicted - meanY, 2);
  }, 0);

  const rSquared = totalVariation > 0 ? explainedVariation / totalVariation : 0;

  const direction = slope > 0.5 ? 'up' : slope < -0.5 ? 'down' : 'stable';
  const magnitude = Math.abs(slope) / (Math.max(...dataPoints.map(p => p.value)) - Math.min(...dataPoints.map(p => p.value)));
  const confidence = Math.sqrt(rSquared);

  return {
    direction,
    magnitude: Math.min(magnitude, 1),
    confidence,
    dataPoints
  };
}