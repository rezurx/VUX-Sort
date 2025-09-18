/**
 * Task Coordinator - Manages execution patterns and agent coordination
 * Implements sequential, parallel, and collaborative execution patterns
 */

import type {
  VUXSortTask,
  TaskAnalysis,
  AgentResult,
  ExecutionPlan,
  ExecutionPhase,
  SpecialtyDomain
} from './types';
import { getAgentConcurrency } from './agentCapabilities';

export class TaskCoordinator {
  private activeExecutions: Map<string, ExecutionState> = new Map();
  private agentLoad: Map<SpecialtyDomain, number> = new Map();

  constructor() {
    this.initializeAgentLoad();
  }

  /**
   * Create execution plan from task analysis
   */
  public createExecutionPlan(analysis: TaskAnalysis): ExecutionPlan {
    const { coordinationPattern } = analysis;

    switch (coordinationPattern) {
      case 'sequential':
        return this.createSequentialPlan(analysis);
      case 'parallel':
        return this.createParallelPlan(analysis);
      case 'collaborative':
        return this.createCollaborativePlan(analysis);
      default:
        throw new Error(`Unknown coordination pattern: ${coordinationPattern}`);
    }
  }

  /**
   * Execute a task according to its execution plan
   */
  public async executeTask(plan: ExecutionPlan, task: VUXSortTask): Promise<AgentResult[]> {
    const executionId = `exec_${plan.taskId}_${Date.now()}`;

    try {
      this.activeExecutions.set(executionId, {
        plan,
        task,
        startTime: Date.now(),
        currentPhase: 0,
        results: []
      });

      const results: AgentResult[] = [];

      for (const phase of plan.phases) {
        const phaseResults = await this.executePhase(phase, task, executionId);
        results.push(...phaseResults);

        // Check if phase succeeded before continuing
        if (!phaseResults.every(r => r.success)) {
          throw new Error(`Phase ${phase.name} failed`);
        }
      }

      return results;
    } catch (error) {
      console.error(`Execution failed for task ${task.id}:`, error);
      throw error;
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  /**
   * Execute a single phase of the execution plan
   */
  private async executePhase(
    phase: ExecutionPhase,
    task: VUXSortTask,
    executionId: string
  ): Promise<AgentResult[]> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    switch (phase.coordinationPattern) {
      case 'sequential':
        return this.executeSequentialPhase(phase, task);
      case 'parallel':
        return this.executeParallelPhase(phase, task);
      case 'collaborative':
        return this.executeCollaborativePhase(phase, task);
      default:
        throw new Error(`Unknown phase coordination pattern: ${phase.coordinationPattern}`);
    }
  }

  /**
   * Execute agents sequentially
   */
  private async executeSequentialPhase(
    phase: ExecutionPhase,
    task: VUXSortTask
  ): Promise<AgentResult[]> {
    const results: AgentResult[] = [];

    for (const agent of phase.agents) {
      // Check agent availability
      await this.waitForAgentAvailability(agent);

      try {
        this.incrementAgentLoad(agent);
        const result = await this.executeAgent(agent, task, results);
        results.push(result);

        // Stop if agent failed (unless it's optional)
        if (!result.success) {
          console.error(`Agent ${agent} failed in sequential execution`);
          break;
        }
      } finally {
        this.decrementAgentLoad(agent);
      }
    }

    return results;
  }

  /**
   * Execute agents in parallel
   */
  private async executeParallelPhase(
    phase: ExecutionPhase,
    task: VUXSortTask
  ): Promise<AgentResult[]> {
    // Wait for all agents to be available
    await Promise.all(phase.agents.map(agent => this.waitForAgentAvailability(agent)));

    // Increment load for all agents
    phase.agents.forEach(agent => this.incrementAgentLoad(agent));

    try {
      const agentPromises = phase.agents.map(async (agent) => {
        try {
          return await this.executeAgent(agent, task, []);
        } catch (error) {
          return this.createErrorResult(agent, task, error as Error);
        }
      });

      const results = await Promise.all(agentPromises);
      return results;
    } finally {
      // Decrement load for all agents
      phase.agents.forEach(agent => this.decrementAgentLoad(agent));
    }
  }

  /**
   * Execute agents collaboratively
   */
  private async executeCollaborativePhase(
    phase: ExecutionPhase,
    task: VUXSortTask
  ): Promise<AgentResult[]> {
    const results: AgentResult[] = [];

    // Start with primary agent
    const primaryAgent = phase.agents[0];
    await this.waitForAgentAvailability(primaryAgent);

    this.incrementAgentLoad(primaryAgent);

    try {
      const primaryResult = await this.executeAgent(primaryAgent, task, []);
      results.push(primaryResult);

      // If primary succeeded, execute secondary agents with context
      if (primaryResult.success) {
        const secondaryAgents = phase.agents.slice(1);

        for (const agent of secondaryAgents) {
          await this.waitForAgentAvailability(agent);
          this.incrementAgentLoad(agent);

          try {
            const result = await this.executeAgent(agent, task, results);
            results.push(result);
          } finally {
            this.decrementAgentLoad(agent);
          }
        }
      }

      return results;
    } finally {
      this.decrementAgentLoad(primaryAgent);
    }
  }

  /**
   * Execute a single agent (placeholder for actual agent execution)
   */
  private async executeAgent(
    agent: SpecialtyDomain,
    task: VUXSortTask,
    previousResults: AgentResult[]
  ): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      // This is where the actual agent execution would happen
      // For now, simulate agent execution
      const result = await this.simulateAgentExecution(agent, task, previousResults);

      const executionTime = Date.now() - startTime;

      return {
        agentId: agent,
        taskId: task.id,
        success: true,
        output: result,
        metadata: {
          executionTime,
          resourcesUsed: this.getAgentResources(agent),
          confidence: this.calculateConfidence(agent, task),
          errors: [],
          warnings: []
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return this.createErrorResult(agent, task, error as Error);
    }
  }

  /**
   * Simulate agent execution (placeholder)
   */
  private async simulateAgentExecution(
    agent: SpecialtyDomain,
    task: VUXSortTask,
    _previousResults: AgentResult[]
  ): Promise<any> {
    // Simulate processing time based on agent type and task complexity
    const baseTime = this.getAgentBaseProcessingTime(agent);
    const complexityMultiplier = task.complexity === 'simple' ? 1 :
                                task.complexity === 'moderate' ? 2 : 3;

    const processingTime = baseTime * complexityMultiplier;

    await new Promise(resolve => setTimeout(resolve, processingTime));

    return {
      agent,
      taskId: task.id,
      processedRequirements: task.requirements,
      agentSpecificOutput: this.generateAgentSpecificOutput(agent, task)
    };
  }

  /**
   * Wait for agent availability
   */
  private async waitForAgentAvailability(agent: SpecialtyDomain): Promise<void> {
    const maxConcurrency = getAgentConcurrency(agent);
    const currentLoad = this.agentLoad.get(agent) || 0;

    if (currentLoad >= maxConcurrency) {
      // Wait for agent to become available
      await new Promise(resolve => {
        const checkAvailability = () => {
          const load = this.agentLoad.get(agent) || 0;
          if (load < maxConcurrency) {
            resolve(void 0);
          } else {
            setTimeout(checkAvailability, 100);
          }
        };
        checkAvailability();
      });
    }
  }

  // Helper methods

  private createSequentialPlan(analysis: TaskAnalysis): ExecutionPlan {
    const agents = [analysis.primaryAgent, ...analysis.secondaryAgents];
    const estimatedTimePerAgent = this.estimateAgentTime(analysis.taskId);

    return {
      taskId: analysis.taskId,
      phases: [{
        phaseId: 'sequential-execution',
        name: 'Sequential Execution',
        agents,
        coordinationPattern: 'sequential',
        dependencies: analysis.dependencies,
        estimatedTime: estimatedTimePerAgent * agents.length,
        qualityGates: analysis.qualityGates.map(qg => qg.id)
      }],
      totalEstimatedTime: estimatedTimePerAgent * agents.length,
      riskFactors: this.identifyRiskFactors(analysis),
      successCriteria: this.generateSuccessCriteria(analysis)
    };
  }

  private createParallelPlan(analysis: TaskAnalysis): ExecutionPlan {
    const agents = [analysis.primaryAgent, ...analysis.secondaryAgents];
    const estimatedTimePerAgent = this.estimateAgentTime(analysis.taskId);

    return {
      taskId: analysis.taskId,
      phases: [{
        phaseId: 'parallel-execution',
        name: 'Parallel Execution',
        agents,
        coordinationPattern: 'parallel',
        dependencies: analysis.dependencies,
        estimatedTime: Math.max(estimatedTimePerAgent), // Parallel execution time
        qualityGates: analysis.qualityGates.map(qg => qg.id)
      }],
      totalEstimatedTime: Math.max(estimatedTimePerAgent),
      riskFactors: this.identifyRiskFactors(analysis),
      successCriteria: this.generateSuccessCriteria(analysis)
    };
  }

  private createCollaborativePlan(analysis: TaskAnalysis): ExecutionPlan {
    const primaryPhase: ExecutionPhase = {
      phaseId: 'primary-analysis',
      name: 'Primary Agent Analysis',
      agents: [analysis.primaryAgent],
      coordinationPattern: 'sequential',
      dependencies: analysis.dependencies,
      estimatedTime: this.estimateAgentTime(analysis.taskId),
      qualityGates: analysis.qualityGates.filter(qg => qg.required).map(qg => qg.id)
    };

    const collaborativePhase: ExecutionPhase = {
      phaseId: 'collaborative-execution',
      name: 'Collaborative Execution',
      agents: analysis.secondaryAgents,
      coordinationPattern: 'parallel',
      dependencies: ['primary-analysis'],
      estimatedTime: Math.max(this.estimateAgentTime(analysis.taskId)),
      qualityGates: analysis.qualityGates.map(qg => qg.id)
    };

    const totalTime = primaryPhase.estimatedTime + collaborativePhase.estimatedTime;

    return {
      taskId: analysis.taskId,
      phases: [primaryPhase, collaborativePhase],
      totalEstimatedTime: totalTime,
      riskFactors: this.identifyRiskFactors(analysis),
      successCriteria: this.generateSuccessCriteria(analysis)
    };
  }

  private initializeAgentLoad(): void {
    const agents: SpecialtyDomain[] = [
      'card-sort-specialist', 'analytics-specialist', 'collaboration-specialist',
      'participant-specialist', 'frontend-ux-specialist', 'integration-specialist'
    ];

    agents.forEach(agent => {
      this.agentLoad.set(agent, 0);
    });
  }

  private incrementAgentLoad(agent: SpecialtyDomain): void {
    const current = this.agentLoad.get(agent) || 0;
    this.agentLoad.set(agent, current + 1);
  }

  private decrementAgentLoad(agent: SpecialtyDomain): void {
    const current = this.agentLoad.get(agent) || 0;
    this.agentLoad.set(agent, Math.max(0, current - 1));
  }

  private createErrorResult(agent: SpecialtyDomain, task: VUXSortTask, error: Error): AgentResult {
    return {
      agentId: agent,
      taskId: task.id,
      success: false,
      output: null,
      metadata: {
        executionTime: 0,
        resourcesUsed: [],
        confidence: 0,
        errors: [error.message],
        warnings: []
      },
      timestamp: new Date().toISOString()
    };
  }

  private getAgentResources(agent: SpecialtyDomain): string[] {
    const resourceMap: Record<SpecialtyDomain, string[]> = {
      'card-sort-specialist': ['sort-algorithms', 'study-templates', 'category-management'],
      'analytics-specialist': ['d3.js', 'statistical-libraries', 'visualization-engines'],
      'collaboration-specialist': ['websocket-connections', 'real-time-protocols'],
      'participant-specialist': ['email-services', 'csv-processors', 'demographic-validators'],
      'frontend-ux-specialist': ['react-components', 'css-frameworks', 'accessibility-tools'],
      'integration-specialist': ['api-endpoints', 'database-connections', 'external-services']
    };

    return resourceMap[agent] || [];
  }

  private calculateConfidence(_agent: SpecialtyDomain, task: VUXSortTask): number {
    // Simplified confidence calculation based on agent expertise match
    const baseConfidence = 0.8;
    const complexityPenalty = task.complexity === 'complex' ? 0.1 : 0;

    return Math.max(0.5, baseConfidence - complexityPenalty);
  }

  private getAgentBaseProcessingTime(agent: SpecialtyDomain): number {
    const timeMap: Record<SpecialtyDomain, number> = {
      'card-sort-specialist': 500,
      'analytics-specialist': 1000,
      'collaboration-specialist': 750,
      'participant-specialist': 600,
      'frontend-ux-specialist': 800,
      'integration-specialist': 900
    };

    return timeMap[agent] || 500;
  }

  private generateAgentSpecificOutput(_agent: SpecialtyDomain, _task: VUXSortTask): any {
    // Agent-specific output simulation
    return {
      analysisComplete: true,
      recommendationsGenerated: true,
      implementationReady: true
    };
  }

  private estimateAgentTime(_taskId: string): number {
    // Simplified time estimation - would be more sophisticated in real implementation
    return 5000; // 5 seconds simulation time
  }

  private identifyRiskFactors(analysis: TaskAnalysis): string[] {
    const risks: string[] = [];

    if (analysis.riskLevel === 'high') {
      risks.push('High complexity task');
    }

    if (analysis.secondaryAgents.length > 2) {
      risks.push('Multiple agent coordination required');
    }

    if (analysis.dependencies.length > 0) {
      risks.push('External dependencies present');
    }

    return risks;
  }

  private generateSuccessCriteria(_analysis: TaskAnalysis): string[] {
    return [
      'All quality gates passed',
      'No critical errors in execution',
      'Agent confidence levels above threshold',
      'Task requirements fulfilled'
    ];
  }
}

interface ExecutionState {
  plan: ExecutionPlan;
  task: VUXSortTask;
  startTime: number;
  currentPhase: number;
  results: AgentResult[];
}