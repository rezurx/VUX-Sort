/**
 * Task Analyzer - Intelligent task routing and complexity assessment
 * Analyzes incoming tasks and determines optimal agent assignment and coordination patterns
 */

import type {
  VUXSortTask,
  TaskAnalysis,
  SpecialtyDomain,
  CoordinationPattern,
  TaskComplexity,
  QualityGate
} from './types';
import { AGENT_CAPABILITIES, canAgentsCollaborate } from './agentCapabilities';

/**
 * Primary domain detection based on task content analysis
 */
export function detectPrimaryDomain(task: VUXSortTask): SpecialtyDomain {
  const content = (task.description + ' ' + task.requirements.join(' ')).toLowerCase();

  // Score each domain based on keyword matches
  const domainScores: Record<SpecialtyDomain, number> = {
    'card-sort-specialist': 0,
    'analytics-specialist': 0,
    'collaboration-specialist': 0,
    'participant-specialist': 0,
    'frontend-ux-specialist': 0,
    'integration-specialist': 0
  };

  // Calculate scores for each domain
  Object.entries(AGENT_CAPABILITIES).forEach(([domain, capability]) => {
    const triggers = capability.triggers;
    triggers.forEach(trigger => {
      if (content.includes(trigger.toLowerCase())) {
        domainScores[domain as SpecialtyDomain] += getKeywordWeight(trigger);
      }
    });
  });

  // Apply domain-specific boost based on explicit mentions
  if (content.includes('analytics') || content.includes('visualization') || content.includes('matrix')) {
    domainScores['analytics-specialist'] *= 1.5;
  }
  if (content.includes('real-time') || content.includes('collaboration') || content.includes('live')) {
    domainScores['collaboration-specialist'] *= 1.5;
  }
  if (content.includes('participant') || content.includes('recruitment') || content.includes('demographic')) {
    domainScores['participant-specialist'] *= 1.5;
  }
  if (content.includes('interface') || content.includes('mobile') || content.includes('accessibility')) {
    domainScores['frontend-ux-specialist'] *= 1.5;
  }
  if (content.includes('api') || content.includes('integration') || content.includes('export')) {
    domainScores['integration-specialist'] *= 1.5;
  }

  // Find domain with highest score
  const topDomain = Object.entries(domainScores).reduce((max, [domain, score]) =>
    score > max[1] ? [domain, score] : max, ['card-sort-specialist', 0]
  );

  return topDomain[0] as SpecialtyDomain;
}

/**
 * Identify all relevant domains for a task
 */
export function identifyAllDomains(task: VUXSortTask): SpecialtyDomain[] {
  const content = (task.description + ' ' + task.requirements.join(' ')).toLowerCase();
  const relevantDomains: Set<SpecialtyDomain> = new Set();

  Object.entries(AGENT_CAPABILITIES).forEach(([domain, capability]) => {
    const triggers = capability.triggers;
    let matchCount = 0;

    triggers.forEach(trigger => {
      if (content.includes(trigger.toLowerCase())) {
        matchCount++;
      }
    });

    // Domain is relevant if it has multiple matches or high-weight matches
    if (matchCount >= 2 || matchCount >= 1 && hasHighPriorityKeywords(content, triggers)) {
      relevantDomains.add(domain as SpecialtyDomain);
    }
  });

  // Ensure at least one domain is selected
  if (relevantDomains.size === 0) {
    relevantDomains.add(detectPrimaryDomain(task));
  }

  return Array.from(relevantDomains);
}

/**
 * Assess task complexity based on multiple factors
 */
export function assessComplexity(task: VUXSortTask): TaskComplexity {
  let complexityScore = 0;

  // File count factor
  const fileCount = task.files?.length || 0;
  if (fileCount > 10) complexityScore += 3;
  else if (fileCount > 5) complexityScore += 2;
  else if (fileCount > 2) complexityScore += 1;

  // Requirements complexity
  const requirementCount = task.requirements.length;
  if (requirementCount > 8) complexityScore += 3;
  else if (requirementCount > 4) complexityScore += 2;
  else if (requirementCount > 2) complexityScore += 1;

  // Description complexity (word count and technical terms)
  const wordCount = task.description.split(' ').length;
  if (wordCount > 100) complexityScore += 2;
  else if (wordCount > 50) complexityScore += 1;

  // Technical complexity indicators
  const complexityKeywords = [
    'algorithm', 'optimization', 'integration', 'real-time', 'analytics',
    'visualization', 'machine learning', 'ai', 'clustering', 'statistical',
    'multi-user', 'concurrent', 'scalability', 'performance'
  ];

  const content = task.description.toLowerCase();
  complexityKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      complexityScore += 1;
    }
  });

  // Domain count factor
  const domainCount = identifyAllDomains(task).length;
  if (domainCount > 3) complexityScore += 3;
  else if (domainCount > 2) complexityScore += 2;
  else if (domainCount > 1) complexityScore += 1;

  // Convert score to complexity level
  if (complexityScore <= 3) return 'simple';
  if (complexityScore <= 8) return 'moderate';
  return 'complex';
}

/**
 * Determine if a task can be parallelized
 */
export function isParallelizable(task: VUXSortTask): boolean {
  const domains = identifyAllDomains(task);

  // Single domain tasks are not parallelizable
  if (domains.length <= 1) return false;

  // Check if domains can collaborate
  for (let i = 0; i < domains.length; i++) {
    for (let j = i + 1; j < domains.length; j++) {
      if (!canAgentsCollaborate(domains[i], domains[j])) {
        return false; // If any pair can't collaborate, not parallelizable
      }
    }
  }

  // Check for sequential dependencies
  const content = task.description.toLowerCase();
  const sequentialIndicators = [
    'then', 'after', 'before', 'depends on', 'requires completion',
    'sequential', 'step by step', 'in order'
  ];

  return !sequentialIndicators.some(indicator => content.includes(indicator));
}

/**
 * Determine coordination pattern for a task
 */
export function determineCoordination(task: VUXSortTask): TaskAnalysis {
  const complexity = assessComplexity(task);
  const domains = identifyAllDomains(task);
  const primaryAgent = detectPrimaryDomain(task);
  const secondaryAgents = domains.filter(d => d !== primaryAgent);

  let coordinationPattern: CoordinationPattern = 'sequential';
  let estimatedEffort = 'Unknown';
  let riskLevel: 'low' | 'medium' | 'high' = 'low';

  // Determine coordination pattern
  if (domains.length === 1) {
    coordinationPattern = 'sequential';
    estimatedEffort = complexity === 'simple' ? '1-2 hours' :
                     complexity === 'moderate' ? '4-8 hours' : '1-3 days';
    riskLevel = complexity === 'simple' ? 'low' :
               complexity === 'moderate' ? 'medium' : 'high';
  } else if (isParallelizable(task) && complexity !== 'complex') {
    coordinationPattern = 'parallel';
    estimatedEffort = complexity === 'moderate' ? '4-6 hours' : '1-2 days';
    riskLevel = complexity === 'moderate' ? 'medium' : 'high';
  } else {
    coordinationPattern = 'collaborative';
    estimatedEffort = complexity === 'moderate' ? '8-12 hours' : '2-5 days';
    riskLevel = 'high';
  }

  return {
    taskId: task.id,
    primaryAgent,
    secondaryAgents,
    coordinationPattern,
    estimatedEffort,
    dependencies: extractDependencies(task),
    riskLevel,
    qualityGates: generateQualityGates(task, domains)
  };
}

/**
 * Extract dependencies from task description
 */
function extractDependencies(task: VUXSortTask): string[] {
  const dependencies: string[] = [];
  const content = task.description.toLowerCase();

  // Common dependency patterns
  const dependencyPatterns = [
    /depends on ([\w\s]+)/g,
    /requires ([\w\s]+)/g,
    /after ([\w\s]+)/g,
    /needs ([\w\s]+) to be completed/g
  ];

  dependencyPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      dependencies.push(match[1].trim());
    }
  });

  return dependencies;
}

/**
 * Generate quality gates based on task and domains
 */
function generateQualityGates(_task: VUXSortTask, domains: SpecialtyDomain[]): QualityGate[] {
  const gates: QualityGate[] = [];

  // Universal quality gates
  gates.push({
    id: 'type-safety',
    name: 'TypeScript Compilation',
    criteria: ['No TypeScript errors', 'Strict type checking passes'],
    required: true,
    validator: (result) => result.success && !result.metadata.errors?.length
  });

  // Domain-specific quality gates
  if (domains.includes('analytics-specialist')) {
    gates.push({
      id: 'analytics-validation',
      name: 'Analytics Data Validation',
      criteria: ['Statistical calculations accurate', 'Visualizations render correctly'],
      required: true,
      validator: (result) => result.success && result.metadata.confidence > 0.8
    });
  }

  if (domains.includes('frontend-ux-specialist')) {
    gates.push({
      id: 'accessibility-check',
      name: 'Accessibility Compliance',
      criteria: ['ARIA labels present', 'Keyboard navigation works', 'Color contrast meets WCAG'],
      required: true,
      validator: (result) => result.success && !result.metadata.errors?.some(e => e.includes('accessibility'))
    });
  }

  if (domains.includes('collaboration-specialist')) {
    gates.push({
      id: 'real-time-performance',
      name: 'Real-time Performance',
      criteria: ['WebSocket connections stable', 'Latency under 100ms', 'No memory leaks'],
      required: true,
      validator: (result) => result.success && result.metadata.executionTime < 100
    });
  }

  return gates;
}

/**
 * Get keyword weight for scoring
 */
function getKeywordWeight(keyword: string): number {
  const highPriorityKeywords = [
    'analytics', 'real-time', 'collaboration', 'accessibility', 'integration',
    'similarity matrix', 'dendrogram', 'drag and drop'
  ];

  return highPriorityKeywords.includes(keyword.toLowerCase()) ? 2 : 1;
}

/**
 * Check if content has high priority keywords
 */
function hasHighPriorityKeywords(content: string, triggers: string[]): boolean {
  const highPriorityKeywords = [
    'analytics', 'real-time', 'collaboration', 'accessibility', 'integration'
  ];

  return triggers.some(trigger =>
    highPriorityKeywords.includes(trigger.toLowerCase()) &&
    content.includes(trigger.toLowerCase())
  );
}