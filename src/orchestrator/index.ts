/**
 * VUX-Sort Orchestrator - Main Export Module
 * Provides a clean interface for using the orchestrator system
 */

// Core orchestrator exports
export { VUXSortOrchestrator } from './orchestrator';
export type {
  TaskExecutionResult,
  ExecutionMetrics,
  TaskExecution,
  QualityReport,
  QualityCheckResult,
  AgentPerformanceStats,
  SystemHealthReport,
  AgentHealthStatus
} from './orchestrator';

// Task management exports
export {
  detectPrimaryDomain,
  identifyAllDomains,
  assessComplexity,
  determineCoordination,
  isParallelizable
} from './taskAnalyzer';

// Coordination exports
export { TaskCoordinator } from './coordinator';

// Quality assurance exports
export { QualityAssurance } from './qualityAssurance';
export type { QualityConfig } from './qualityAssurance';

// Configuration management exports
export { ConfigManager } from './configManager';
export type { ValidationResult } from './configManager';

// Agent capabilities exports
export {
  AGENT_CAPABILITIES,
  getAgentTriggers,
  getCollaboratingAgents,
  canAgentsCollaborate,
  getAgentConcurrency
} from './agentCapabilities';

// Core types exports
export type {
  VUXSortTask,
  TaskAnalysis,
  TaskType,
  TaskComplexity,
  TaskUrgency,
  CoordinationPattern,
  SpecialtyDomain,
  AgentResult,
  AgentCapability,
  ExecutionPlan,
  ExecutionPhase,
  OrchestratorConfig,
  AgentConfig,
  OrchestratorMetrics,
  AgentMetrics,
  QualityGate,
  TaskPredicate,
  AgentSelector,
  CoordinationStrategy
} from './types';

import { VUXSortOrchestrator } from './orchestrator';

// Convenience factory function
export function createOrchestrator(config?: Partial<import('./types').OrchestratorConfig>) {
  return new VUXSortOrchestrator(config);
}

// Sample task factory for testing
export function createSampleTask(
  description: string,
  requirements: string[] = [],
  complexity: import('./types').TaskComplexity = 'moderate'
): import('./types').VUXSortTask {
  return {
    id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    description,
    type: 'feature',
    domain: [], // Will be determined by analysis
    complexity,
    requirements,
    urgency: 'medium',
    metadata: {
      estimatedHours: complexity === 'simple' ? 2 : complexity === 'moderate' ? 8 : 24,
      dependencies: [],
      relatedTasks: [],
      businessValue: Math.floor(Math.random() * 10) + 1
    }
  };
}

// Utility functions
export const OrchestratorUtils = {
  /**
   * Create a simple task for testing
   */
  createTestTask: (description: string, requirements: string[] = []) =>
    createSampleTask(description, requirements, 'simple'),

  /**
   * Create a complex analytics task
   */
  createAnalyticsTask: (description: string, requirements: string[] = []) =>
    createSampleTask(
      `Analytics: ${description}`,
      ['similarity matrix generation', 'statistical analysis', ...requirements],
      'moderate'
    ),

  /**
   * Create a UI/UX task
   */
  createUITask: (description: string, requirements: string[] = []) =>
    createSampleTask(
      `UI/UX: ${description}`,
      ['responsive design', 'accessibility compliance', ...requirements],
      'moderate'
    ),

  /**
   * Create a collaboration task
   */
  createCollaborationTask: (description: string, requirements: string[] = []) =>
    createSampleTask(
      `Collaboration: ${description}`,
      ['real-time functionality', 'multi-user support', ...requirements],
      'complex'
    ),

  /**
   * Validate task structure
   */
  validateTask: (task: import('./types').VUXSortTask): boolean => {
    return !!(
      task.id &&
      task.description &&
      task.type &&
      task.complexity &&
      Array.isArray(task.requirements) &&
      task.urgency
    );
  },

  /**
   * Get task summary for logging
   */
  getTaskSummary: (task: import('./types').VUXSortTask): string => {
    return `Task ${task.id}: ${task.description.substring(0, 50)}... [${task.type}/${task.complexity}/${task.urgency}]`;
  }
};

// Example usage patterns
export const UsageExamples = {
  /**
   * Basic orchestrator setup and task processing
   */
  basicUsage: `
    import { createOrchestrator, createSampleTask } from './orchestrator';

    const orchestrator = createOrchestrator();
    const task = createSampleTask('Implement similarity matrix visualization', [
      'D3.js integration',
      'Interactive heatmap',
      'Export functionality'
    ]);

    const result = await orchestrator.processTask(task);
    console.log('Execution result:', result.success);
    console.log('Quality score:', result.qualityReport.score);
  `,

  /**
   * Advanced configuration with custom settings
   */
  advancedConfiguration: `
    import { createOrchestrator } from './orchestrator';

    const orchestrator = createOrchestrator({
      agents: {
        'analytics-specialist': {
          enabled: true,
          priority: 10,
          maxConcurrency: 5,
          timeout: 60000
        }
      },
      orchestrator: {
        maxConcurrentAgents: 5,
        qualityGates: true,
        timeoutMs: 600000
      }
    });

    // Apply production performance profile
    orchestrator.updateConfig({
      orchestrator: { retryAttempts: 3 }
    });
  `,

  /**
   * Monitoring and metrics
   */
  monitoringExample: `
    import { createOrchestrator } from './orchestrator';

    const orchestrator = createOrchestrator();

    // Process several tasks...
    await orchestrator.processTask(task1);
    await orchestrator.processTask(task2);

    // Get performance metrics
    const metrics = orchestrator.getMetrics();
    console.log('Success rate:', metrics.successfulTasks / metrics.totalTasks);

    const agentPerformance = orchestrator.getAgentPerformance();
    console.log('Agent performance:', agentPerformance);

    // Check system health
    const healthReport = await orchestrator.checkSystemHealth();
    console.log('System status:', healthReport.overall);
  `
};

// Version information
export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

// Default export
export default VUXSortOrchestrator;