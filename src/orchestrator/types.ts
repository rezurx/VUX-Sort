/**
 * VUX-Sort Orchestrator Types
 * Core TypeScript interfaces for intelligent task routing and agent coordination
 */

export type SpecialtyDomain =
  | 'card-sort-specialist'
  | 'analytics-specialist'
  | 'collaboration-specialist'
  | 'participant-specialist'
  | 'frontend-ux-specialist'
  | 'integration-specialist';

export type TaskType = 'feature' | 'bug' | 'optimization' | 'analysis';
export type TaskComplexity = 'simple' | 'moderate' | 'complex';
export type TaskUrgency = 'low' | 'medium' | 'high';
export type CoordinationPattern = 'sequential' | 'parallel' | 'collaborative';

export interface VUXSortTask {
  id: string;
  description: string;
  type: TaskType;
  domain: SpecialtyDomain[];
  complexity: TaskComplexity;
  files?: string[];
  requirements: string[];
  urgency: TaskUrgency;
  metadata?: {
    estimatedHours?: number;
    dependencies?: string[];
    relatedTasks?: string[];
    businessValue?: number;
  };
}

export interface TaskAnalysis {
  taskId: string;
  primaryAgent: SpecialtyDomain;
  secondaryAgents: SpecialtyDomain[];
  coordinationPattern: CoordinationPattern;
  estimatedEffort: string;
  dependencies: string[];
  riskLevel: 'low' | 'medium' | 'high';
  qualityGates: QualityGate[];
}

export interface QualityGate {
  id: string;
  name: string;
  criteria: string[];
  required: boolean;
  validator: (result: AgentResult) => boolean;
}

export interface AgentResult {
  agentId: SpecialtyDomain;
  taskId: string;
  success: boolean;
  output: any;
  metadata: {
    executionTime: number;
    resourcesUsed: string[];
    confidence: number;
    errors?: string[];
    warnings?: string[];
  };
  timestamp: string;
}

export interface AgentCapability {
  domain: SpecialtyDomain;
  primarySkills: string[];
  secondarySkills: string[];
  triggers: string[];
  conflictsWith?: SpecialtyDomain[];
  collaboratesWith?: SpecialtyDomain[];
  maxConcurrency: number;
}

export interface OrchestratorConfig {
  agents: Record<SpecialtyDomain, AgentConfig>;
  orchestrator: {
    defaultCoordination: CoordinationPattern;
    maxConcurrentAgents: number;
    qualityGates: boolean;
    timeoutMs: number;
    retryAttempts: number;
  };
  routing: {
    keywordWeights: Record<string, number>;
    domainPriorities: Record<SpecialtyDomain, number>;
    complexityThresholds: {
      simple: number;
      moderate: number;
      complex: number;
    };
  };
}

export interface AgentConfig {
  enabled: boolean;
  priority: number;
  triggers: string[];
  maxConcurrency: number;
  timeout: number;
  qualityThreshold: number;
  specializations: string[];
}

export interface ExecutionPlan {
  taskId: string;
  phases: ExecutionPhase[];
  totalEstimatedTime: number;
  riskFactors: string[];
  successCriteria: string[];
}

export interface ExecutionPhase {
  phaseId: string;
  name: string;
  agents: SpecialtyDomain[];
  coordinationPattern: CoordinationPattern;
  dependencies: string[];
  estimatedTime: number;
  qualityGates: string[];
}

export interface OrchestratorMetrics {
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  averageExecutionTime: number;
  agentPerformance: Record<SpecialtyDomain, AgentMetrics>;
  coordinationEfficiency: Record<CoordinationPattern, number>;
}

export interface AgentMetrics {
  domain: SpecialtyDomain;
  tasksHandled: number;
  successRate: number;
  averageExecutionTime: number;
  qualityScore: number;
  collaborationScore: number;
}

// Utility types for enhanced type safety
export type TaskPredicate = (task: VUXSortTask) => boolean;
export type AgentSelector = (task: VUXSortTask) => SpecialtyDomain[];
export type CoordinationStrategy = (agents: SpecialtyDomain[], task: VUXSortTask) => ExecutionPlan;