// Core types for VUX Sort - Information Architecture Evaluation Platform

// Study Types
export type StudyType = 'card-sorting' | 'open-card-sorting' | 'hybrid-card-sorting' | 'sequential-card-sorting' | 'tree-testing' | 'reverse-card-sorting';
export type SortType = 'open' | 'closed' | 'hybrid';

export interface Card {
  id: number;
  text: string;
  // Rich content support
  image?: {
    data: string; // Base64 encoded image data
    fileName: string;
    fileSize: number;
    mimeType: string;
    dimensions?: { width: number; height: number };
  };
  icon?: {
    name: string; // Lucide icon name
    color?: string;
    size?: number;
  };
  metadata?: {
    complexity?: 'low' | 'medium' | 'high';
    category?: string;
    priority?: number;
    tags?: string[];
    url?: string; // For tree testing
    description?: string;
    // Rich content metadata
    hasVisualContent?: boolean;
    visualContentType?: 'image' | 'icon' | 'both';
  };
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  cards: Card[];
  isUserCreated?: boolean; // For open card sorting
}

// Tree Structure for Tree Testing
export interface TreeNode {
  id: number;
  name: string;
  parentId?: number;
  children: TreeNode[];
  path?: string[];
  level: number;
  url?: string;
  isExpanded?: boolean;
}

// Participant Management
export interface ParticipantInvite {
  id: string;
  studyId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  demographics?: Record<string, any>;
  inviteCode: string; // Unique code for participant link
  status: 'invited' | 'started' | 'completed' | 'expired';
  invitedAt: string;
  completedAt?: string;
  remindersSent: number;
  customFields?: Record<string, any>;
}

export interface StudyParticipantConfig {
  requireDemographics: boolean;
  demographicFields: DemographicField[];
  maxParticipants?: number;
  expirationDays?: number;
  allowAnonymous: boolean;
  requireEmail: boolean;
}

export interface DemographicField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multiSelect' | 'radio' | 'checkbox' | 'date';
  required: boolean;
  options?: string[]; // For select, radio, etc.
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface Study {
  id: number;
  name: string;
  description?: string;
  type: StudyType;
  cards: Card[];
  categories: Category[];
  treeStructure?: TreeNode[];
  tasks?: string[]; // For tree testing tasks
  participants: number;
  participantConfig?: StudyParticipantConfig;
  invites?: ParticipantInvite[];
  created: string;
  updated: string;
  settings: StudySettings;
}

export interface StudySettings {
  maxParticipants?: number;
  minParticipants?: number;

  // Card Sorting Settings
  sortType?: SortType;
  allowCustomCategories?: boolean;
  shuffleCards?: boolean;
  showCardNumbers?: boolean;
  allowUncategorized?: boolean;
  requireAllCardsPlaced?: boolean;
  maxCustomCategories?: number;
  minCardsPerCategory?: number;

  // Tree Testing Settings
  showBreadcrumbs?: boolean;
  allowBacktracking?: boolean;
  showSearchFunctionality?: boolean;
  maxDepth?: number;
  timeLimit?: number; // in seconds

  // General Settings
  showProgress?: boolean;
  allowPause?: boolean;
  theme?: 'default' | 'light' | 'dark';
  collectDemographics?: boolean;
  consentRequired?: boolean;

  // Style Customization
  styleTheme?: StyleTheme;
}

// Card and Category Styling
export interface CardStyle {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  borderWidth: number;
  borderRadius: number;
  shadow: 'none' | 'sm' | 'md' | 'lg';
  fontSize: 'xs' | 'sm' | 'base' | 'lg';
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  padding: 'sm' | 'md' | 'lg';
}

export interface CategoryStyle {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  headerBackgroundColor: string;
  headerTextColor: string;
  borderWidth: number;
  borderRadius: number;
  shadow: 'none' | 'sm' | 'md' | 'lg';
  minHeight: number;
}

export interface StyleTheme {
  id: string;
  name: string;
  description: string;
  cardStyle: CardStyle;
  categoryStyle: CategoryStyle;
  globalStyles: {
    fontFamily: string;
    backgroundColor: string;
    accentColor: string;
  };
}

// Results Types
export interface BaseResult {
  participantId: string;
  studyId: number;
  studyType: StudyType;
  startTime: number;
  completionTime: number;
  totalDuration: number;
  inviteCode?: string;
  demographics?: Record<string, any>;
  participantName?: string;
  participantEmail?: string;
}

export interface CardSortResult extends BaseResult {
  studyType: 'card-sorting' | 'open-card-sorting' | 'hybrid-card-sorting' | 'sequential-card-sorting' | 'reverse-card-sorting';
  cardSortResults: CategoryResult[]; // Keep required for backward compatibility
  customCategories?: CategoryResult[]; // For open card sorting
  categories?: Category[]; // New unified structure for hybrid/sequential sorting
  uncategorizedCards?: Card[];
  hybridData?: HybridSortData; // For hybrid sorting
  sequentialData?: SequentialSortData; // For sequential sorting
}

// Hybrid sorting support
export interface HybridSortData {
  phases: HybridPhase[];
  finalMode: 'closed' | 'open' | 'mixed';
  modesUsed: string[];
  categoriesCreated: number;
  categoriesUsed: number;
  phaseTransitions?: PhaseTransition[];
}

export interface HybridPhase {
  id: string;
  name: string;
  mode: 'closed' | 'open' | 'mixed';
  description: string;
  allowModeSwitch: boolean;
  completed: boolean;
  timeSpent: number;
  startTime?: number;
  endTime?: number;
}

export interface PhaseTransition {
  fromPhase: string;
  toPhase: string;
  timestamp: number;
  cardsChanged: number;
  categoriesChanged: number;
}

// Sequential sorting support
export interface SequentialSortData {
  stages: SequentialStage[];
  transitions: StageTransition[];
  totalStages: number;
  finalStage: number;
  categoriesEvolution: CategoryEvolution[];
}

export interface SequentialStage {
  id: string;
  name: string;
  description: string;
  objective: string;
  allowCreateCategories: boolean;
  allowEditCategories: boolean;
  allowDeleteCategories: boolean;
  minCardsPerCategory: number;
  maxUncategorized: number;
  completed: boolean;
  timeSpent: number;
}

export interface StageTransition {
  stageId: string;
  startTime: number;
  endTime?: number;
  categoriesAtStart: Category[];
  categoriesAtEnd?: Category[];
  unsortedAtStart: Card[];
  unsortedAtEnd?: Card[];
  validationPassed: boolean;
  userNotes?: string;
}

export interface CategoryEvolution {
  stageId: string;
  categoriesCount: number;
  cardsPerCategory: number[];
  userNotes?: string;
}

export interface TreeTestResult extends BaseResult {
  studyType: 'tree-testing';
  treeTestResults: TaskResult[];
}

export interface TaskResult {
  taskId: number;
  task: string;
  path: string[];
  success: boolean;
  clicks: number;
  duration: number;
  finalDestination: string;
  gaveUp: boolean;
  directSuccess: boolean; // Found without backtracking
}

export interface CategoryResult {
  categoryId: number;
  categoryName: string;
  cards: { id: number; text: string }[];
  isCustomCategory?: boolean;
}

export type StudyResult = CardSortResult | TreeTestResult;

export interface SimilarityPair {
  cardId1: number;
  cardId2: number;
  cardName1: string;
  cardName2: string;
  coOccurrence: number;
  similarity: number;
}

export interface CategoryFrequency {
  categoryId: number;
  categoryName: string;
  usage: number;
  percentage: number;
  cards: { id: number; text: string; frequency: number }[];
}

export type ViewMode = 'dashboard' | 'study-creator' | 'participant-view' | 'analytics' | 'participant-complete' | 'participant-manager' | 'participant-entry';

export interface ParticipantSession {
  participantId: string;
  studyId: number;
  startTime: number;
  isComplete: boolean;
  studyType: StudyType;
  inviteCode?: string;
  demographics?: Record<string, any>;
  participantName?: string;
  participantEmail?: string;
}

// Analytics types
export interface ClusterNode {
  name: string;
  children: ClusterNode[];
  distance: number;
  cardIndex?: number;
  size?: number;
  x?: number;
  y?: number;
}

// Tree Testing Analytics
export interface TreeTestAnalytics {
  taskSuccessRate: number;
  averageClicks: number;
  averageDuration: number;
  directSuccessRate: number;
  mostCommonPaths: PathAnalysis[];
  failurePoints: FailurePoint[];
}

export interface PathAnalysis {
  path: string[];
  frequency: number;
  averageTime: number;
  successRate: number;
}

export interface FailurePoint {
  nodeId: number;
  nodeName: string;
  abandonmentRate: number;
  avgTimeSpent: number;
}

// Bulk Upload Types
export interface BulkUploadData {
  cards?: Card[];
  categories?: Category[];
  treeStructure?: TreeNode[];
  tasks?: string[];
}

export interface CSVParseResult {
  data: any[];
  errors: string[];
  headers: string[];
}