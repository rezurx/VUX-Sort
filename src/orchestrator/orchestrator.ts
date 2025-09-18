/**
 * VUX-Sort Orchestrator - Main orchestration engine
 * Provides the primary interface for task processing and agent coordination
 */

import type {
  VUXSortTask,
  TaskAnalysis,
  AgentResult,
  ExecutionPlan,
  OrchestratorConfig,
  OrchestratorMetrics,
  SpecialtyDomain
} from './types';

import {
  assessComplexity,
  determineCoordination
} from './taskAnalyzer';

import { TaskCoordinator } from './coordinator';
import { QualityAssurance } from './qualityAssurance';
import { ConfigManager } from './configManager';

export class VUXSortOrchestrator {
  private coordinator: TaskCoordinator;
  private qualityAssurance: QualityAssurance;
  private configManager: ConfigManager;
  private metrics: OrchestratorMetrics;
  private taskHistory: Map<string, TaskExecution> = new Map();

  constructor(config?: Partial<OrchestratorConfig>) {
    this.configManager = new ConfigManager(config);
    this.coordinator = new TaskCoordinator();
    this.qualityAssurance = new QualityAssurance(this.configManager.getQualityConfig());
    this.metrics = this.initializeMetrics();
  }

  /**
   * Main entry point - Process a task through the complete orchestration pipeline
   */
  public async processTask(task: VUXSortTask): Promise<TaskExecutionResult> {
    const startTime = Date.now();
    const executionId = this.generateExecutionId(task);

    try {
      // Phase 1: Task Analysis
      console.log(`[Orchestrator] Starting task analysis for: ${task.description.substring(0, 100)}...`);
      const analysis = await this.analyzeTask(task);

      // Phase 2: Execution Planning
      console.log(`[Orchestrator] Creating execution plan with ${analysis.coordinationPattern} coordination`);
      const plan = this.coordinator.createExecutionPlan(analysis);

      // Phase 3: Task Execution
      console.log(`[Orchestrator] Executing task with ${analysis.primaryAgent} as primary agent`);
      const results = await this.executeTask(plan, task);

      // Phase 4: Quality Assurance
      console.log(`[Orchestrator] Running quality assurance checks`);
      const qualityReport = await this.qualityAssurance.validateResults(results, analysis);

      // Phase 5: Metrics Update
      const executionTime = Date.now() - startTime;
      this.updateMetrics(analysis, results, executionTime, qualityReport.passed);

      // Phase 6: Result Compilation
      const executionResult: TaskExecutionResult = {
        executionId,
        task,
        analysis,
        plan,
        results,
        qualityReport,
        metrics: {
          executionTime,
          agentsUsed: [analysis.primaryAgent, ...analysis.secondaryAgents],
          coordinationPattern: analysis.coordinationPattern,
          qualityScore: qualityReport.score
        },
        success: qualityReport.passed && results.every(r => r.success),
        timestamp: new Date().toISOString()
      };

      // Store execution history
      this.taskHistory.set(executionId, {
        task,
        analysis,
        plan,
        results,
        executionTime,
        success: executionResult.success
      });

      console.log(`[Orchestrator] Task completed successfully in ${executionTime}ms`);
      return executionResult;

    } catch (error) {
      console.error(`[Orchestrator] Task execution failed:`, error);
      const executionTime = Date.now() - startTime;

      this.updateMetricsForFailure(task, executionTime);

      throw new OrchestratorError(
        `Task execution failed: ${error instanceof Error ? error.message : String(error)}`,
        {
          executionId,
          task,
          executionTime,
          error: error instanceof Error ? error : new Error(String(error))
        }
      );
    }
  }

  /**
   * Analyze task and determine optimal agent assignment
   */
  public async analyzeTask(task: VUXSortTask): Promise<TaskAnalysis> {
    try {
      const analysis = determineCoordination(task);

      console.log(`[TaskAnalyzer] Task analysis complete:`, {
        primaryAgent: analysis.primaryAgent,
        secondaryAgents: analysis.secondaryAgents,
        coordinationPattern: analysis.coordinationPattern,
        complexity: assessComplexity(task),
        riskLevel: analysis.riskLevel
      });

      return analysis;
    } catch (error) {
      throw new Error(`Task analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Execute task according to execution plan
   */
  private async executeTask(plan: ExecutionPlan, task: VUXSortTask): Promise<AgentResult[]> {
    try {
      return await this.coordinator.executeTask(plan, task);
    } catch (error) {
      throw new Error(`Task execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get orchestrator metrics and performance data
   */
  public getMetrics(): OrchestratorMetrics {
    return { ...this.metrics };
  }

  /**
   * Get task execution history
   */
  public getTaskHistory(limit: number = 10): TaskExecution[] {
    return Array.from(this.taskHistory.values())
      .sort((a, b) => (b.task.metadata?.businessValue || 0) - (a.task.metadata?.businessValue || 0))
      .slice(0, limit);
  }

  /**
   * Get agent performance statistics
   */
  public getAgentPerformance(): Record<SpecialtyDomain, AgentPerformanceStats> {
    const agentStats: Record<SpecialtyDomain, AgentPerformanceStats> = {} as any;

    Array.from(this.taskHistory.values()).forEach(execution => {
      const agents = [execution.analysis.primaryAgent, ...execution.analysis.secondaryAgents];

      agents.forEach(agentId => {
        if (!agentStats[agentId]) {
          agentStats[agentId] = {
            totalTasks: 0,
            successfulTasks: 0,
            totalExecutionTime: 0,
            averageExecutionTime: 0,
            successRate: 0
          };
        }

        const stats = agentStats[agentId];
        stats.totalTasks++;
        stats.totalExecutionTime += execution.executionTime;

        if (execution.success) {
          stats.successfulTasks++;
        }

        stats.averageExecutionTime = stats.totalExecutionTime / stats.totalTasks;
        stats.successRate = (stats.successfulTasks / stats.totalTasks) * 100;
      });
    });

    return agentStats;
  }

  /**
   * Update configuration at runtime
   */
  public updateConfig(configUpdate: Partial<OrchestratorConfig>): void {
    this.configManager.updateConfig(configUpdate);

    // Reinitialize components with new config if needed
    if (configUpdate.orchestrator) {
      // Update coordinator settings
    }

    if (configUpdate.agents) {
      // Update agent configurations
    }
  }

  /**
   * Check system health and agent availability
   */
  public async checkSystemHealth(): Promise<SystemHealthReport> {
    const report: SystemHealthReport = {
      overall: 'healthy',
      agents: {} as Record<SpecialtyDomain, AgentHealthStatus>,
      metrics: this.getMetrics(),
      timestamp: new Date().toISOString()
    };

    // Check individual agent health (simulated)
    const agents: SpecialtyDomain[] = [
      'card-sort-specialist', 'analytics-specialist', 'collaboration-specialist',
      'participant-specialist', 'frontend-ux-specialist', 'integration-specialist'
    ];

    for (const agent of agents) {
      const agentMetrics = this.metrics.agentPerformance[agent];
      const isHealthy = !agentMetrics || agentMetrics.successRate > 80;

      report.agents[agent] = {
        status: isHealthy ? 'healthy' : 'degraded',
        successRate: agentMetrics?.successRate || 100,
        averageResponseTime: agentMetrics?.averageExecutionTime || 0,
        lastActive: new Date().toISOString()
      };

      if (!isHealthy) {
        report.overall = 'degraded';
      }
    }

    return report;
  }

  // Private helper methods

  private initializeMetrics(): OrchestratorMetrics {
    return {
      totalTasks: 0,
      successfulTasks: 0,
      failedTasks: 0,
      averageExecutionTime: 0,
      agentPerformance: {} as Record<SpecialtyDomain, any>,
      coordinationEfficiency: {
        sequential: 0,
        parallel: 0,
        collaborative: 0
      }
    };
  }

  private updateMetrics(
    analysis: TaskAnalysis,
    results: AgentResult[],
    executionTime: number,
    success: boolean
  ): void {
    this.metrics.totalTasks++;

    if (success) {
      this.metrics.successfulTasks++;
    } else {
      this.metrics.failedTasks++;
    }

    // Update average execution time
    const totalExecutionTime = (this.metrics.averageExecutionTime * (this.metrics.totalTasks - 1)) + executionTime;
    this.metrics.averageExecutionTime = totalExecutionTime / this.metrics.totalTasks;

    // Update coordination efficiency
    const patternCount = this.getCoordinationPatternCount(analysis.coordinationPattern);
    const newEfficiency = ((this.metrics.coordinationEfficiency[analysis.coordinationPattern] * (patternCount - 1)) + executionTime) / patternCount;
    this.metrics.coordinationEfficiency[analysis.coordinationPattern] = newEfficiency;

    // Update agent performance
    const agents = [analysis.primaryAgent, ...analysis.secondaryAgents];
    agents.forEach(agentId => {
      if (!this.metrics.agentPerformance[agentId]) {
        this.metrics.agentPerformance[agentId] = {
          domain: agentId,
          tasksHandled: 0,
          successRate: 0,
          averageExecutionTime: 0,
          qualityScore: 0,
          collaborationScore: 0
        };
      }

      const agentMetrics = this.metrics.agentPerformance[agentId];
      agentMetrics.tasksHandled++;

      // Update success rate
      const agentResult = results.find(r => r.agentId === agentId);
      if (agentResult?.success) {
        const newSuccessCount = (agentMetrics.successRate * (agentMetrics.tasksHandled - 1) / 100) + 1;
        agentMetrics.successRate = (newSuccessCount / agentMetrics.tasksHandled) * 100;
      }

      // Update average execution time
      if (agentResult) {
        const newTotalTime = (agentMetrics.averageExecutionTime * (agentMetrics.tasksHandled - 1)) + agentResult.metadata.executionTime;
        agentMetrics.averageExecutionTime = newTotalTime / agentMetrics.tasksHandled;

        // Update quality score
        const newTotalQuality = (agentMetrics.qualityScore * (agentMetrics.tasksHandled - 1)) + agentResult.metadata.confidence;
        agentMetrics.qualityScore = newTotalQuality / agentMetrics.tasksHandled;
      }
    });
  }

  private updateMetricsForFailure(_task: VUXSortTask, executionTime: number): void {
    this.metrics.totalTasks++;
    this.metrics.failedTasks++;

    const totalExecutionTime = (this.metrics.averageExecutionTime * (this.metrics.totalTasks - 1)) + executionTime;
    this.metrics.averageExecutionTime = totalExecutionTime / this.metrics.totalTasks;
  }

  private getCoordinationPatternCount(pattern: string): number {
    return Array.from(this.taskHistory.values())
      .filter(execution => execution.analysis.coordinationPattern === pattern).length;
  }

  private generateExecutionId(task: VUXSortTask): string {
    return `exec_${task.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}

// Supporting interfaces and types

export interface TaskExecutionResult {
  executionId: string;
  task: VUXSortTask;
  analysis: TaskAnalysis;
  plan: ExecutionPlan;
  results: AgentResult[];
  qualityReport: QualityReport;
  metrics: ExecutionMetrics;
  success: boolean;
  timestamp: string;
}

export interface ExecutionMetrics {
  executionTime: number;
  agentsUsed: SpecialtyDomain[];
  coordinationPattern: string;
  qualityScore: number;
}

export interface TaskExecution {
  task: VUXSortTask;
  analysis: TaskAnalysis;
  plan: ExecutionPlan;
  results: AgentResult[];
  executionTime: number;
  success: boolean;
}

export interface QualityReport {
  passed: boolean;
  score: number;
  details: QualityCheckResult[];
  recommendations: string[];
}

export interface QualityCheckResult {
  checkId: string;
  name: string;
  passed: boolean;
  score: number;
  details: string;
}

export interface AgentPerformanceStats {
  totalTasks: number;
  successfulTasks: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  successRate: number;
}

export interface SystemHealthReport {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  agents: Record<SpecialtyDomain, AgentHealthStatus>;
  metrics: OrchestratorMetrics;
  timestamp: string;
}

export interface AgentHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  successRate: number;
  averageResponseTime: number;
  lastActive: string;
}

export class OrchestratorError extends Error {
  public readonly context: any;

  constructor(message: string, context: any) {
    super(message);
    this.name = 'OrchestratorError';
    this.context = context;
  }
}