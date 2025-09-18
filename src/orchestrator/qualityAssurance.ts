/**
 * Quality Assurance System
 * Validates agent results and ensures task completion meets quality standards
 */

import type {
  AgentResult,
  TaskAnalysis,
  QualityGate,
  SpecialtyDomain
} from './types';
import type { QualityReport, QualityCheckResult } from './orchestrator';

export interface QualityConfig {
  enableQualityGates: boolean;
  minimumQualityScore: number;
  requireAllGatesToPass: boolean;
  agentSpecificValidation: boolean;
  timeoutThresholds: Record<SpecialtyDomain, number>;
}

export class QualityAssurance {
  private config: QualityConfig;

  constructor(config: QualityConfig) {
    this.config = config;
  }

  /**
   * Validate task execution results against quality gates
   */
  public async validateResults(results: AgentResult[], analysis: TaskAnalysis): Promise<QualityReport> {
    const checkResults: QualityCheckResult[] = [];
    let overallScore = 0;

    try {
      // Run universal quality checks
      const universalChecks = await this.runUniversalChecks(results);
      checkResults.push(...universalChecks);

      // Run quality gate validations
      if (this.config.enableQualityGates) {
        const gateChecks = await this.runQualityGateChecks(results, analysis.qualityGates);
        checkResults.push(...gateChecks);
      }

      // Run agent-specific validations
      if (this.config.agentSpecificValidation) {
        const agentChecks = await this.runAgentSpecificChecks(results);
        checkResults.push(...agentChecks);
      }

      // Calculate overall score
      overallScore = this.calculateOverallScore(checkResults);

      // Determine if validation passed
      const passedChecks = checkResults.filter(check => check.passed).length;
      const totalChecks = checkResults.length;

      const passed = this.config.requireAllGatesToPass
        ? checkResults.every(check => check.passed)
        : overallScore >= this.config.minimumQualityScore;

      const recommendations = this.generateRecommendations(checkResults, results);

      console.log(`[QualityAssurance] Quality check completed: ${passedChecks}/${totalChecks} checks passed (${overallScore.toFixed(2)}% score)`);

      return {
        passed,
        score: overallScore,
        details: checkResults,
        recommendations
      };

    } catch (error) {
      console.error(`[QualityAssurance] Quality validation failed:`, error);

      return {
        passed: false,
        score: 0,
        details: [{
          checkId: 'validation-error',
          name: 'Quality Validation Error',
          passed: false,
          score: 0,
          details: `Quality validation failed: ${error instanceof Error ? error.message : String(error)}`
        }],
        recommendations: ['Fix quality validation system errors before retrying']
      };
    }
  }

  /**
   * Run universal quality checks that apply to all tasks
   */
  private async runUniversalChecks(results: AgentResult[]): Promise<QualityCheckResult[]> {
    const checks: QualityCheckResult[] = [];

    // Check 1: All agents completed successfully
    const allSuccessful = results.every(result => result.success);
    checks.push({
      checkId: 'agent-completion',
      name: 'Agent Completion Check',
      passed: allSuccessful,
      score: allSuccessful ? 100 : (results.filter(r => r.success).length / results.length) * 100,
      details: allSuccessful
        ? 'All agents completed successfully'
        : `${results.filter(r => r.success).length}/${results.length} agents completed successfully`
    });

    // Check 2: No critical errors
    const criticalErrors = results.flatMap(result => result.metadata.errors || []);
    const hasCriticalErrors = criticalErrors.length > 0;
    checks.push({
      checkId: 'critical-errors',
      name: 'Critical Error Check',
      passed: !hasCriticalErrors,
      score: hasCriticalErrors ? 0 : 100,
      details: hasCriticalErrors
        ? `Found ${criticalErrors.length} critical errors: ${criticalErrors.join(', ')}`
        : 'No critical errors found'
    });

    // Check 3: Agent confidence levels
    const avgConfidence = results.reduce((sum, result) => sum + result.metadata.confidence, 0) / results.length;
    const confidenceThreshold = 0.7;
    const confidencePassed = avgConfidence >= confidenceThreshold;
    checks.push({
      checkId: 'agent-confidence',
      name: 'Agent Confidence Check',
      passed: confidencePassed,
      score: avgConfidence * 100,
      details: `Average agent confidence: ${(avgConfidence * 100).toFixed(1)}% (threshold: ${confidenceThreshold * 100}%)`
    });

    // Check 4: Performance thresholds
    const performanceChecks = await this.checkPerformanceThresholds(results);
    checks.push(...performanceChecks);

    return checks;
  }

  /**
   * Run quality gate specific validations
   */
  private async runQualityGateChecks(results: AgentResult[], qualityGates: QualityGate[]): Promise<QualityCheckResult[]> {
    const checks: QualityCheckResult[] = [];

    for (const gate of qualityGates) {
      try {
        // Find relevant results for this quality gate
        const relevantResults = results.filter(result =>
          this.isResultRelevantForGate(result, gate)
        );

        if (relevantResults.length === 0) {
          checks.push({
            checkId: gate.id,
            name: gate.name,
            passed: !gate.required, // Optional gates pass if no relevant results
            score: gate.required ? 0 : 100,
            details: 'No relevant results found for this quality gate'
          });
          continue;
        }

        // Run the gate validator on each relevant result
        const gateResults = relevantResults.map(result => ({
          result,
          passed: gate.validator(result)
        }));

        const passedCount = gateResults.filter(gr => gr.passed).length;
        const passed = gate.required ? gateResults.every(gr => gr.passed) : passedCount > 0;
        const score = (passedCount / gateResults.length) * 100;

        checks.push({
          checkId: gate.id,
          name: gate.name,
          passed,
          score,
          details: `${passedCount}/${gateResults.length} results passed quality gate criteria: ${gate.criteria.join(', ')}`
        });

      } catch (error) {
        checks.push({
          checkId: gate.id,
          name: gate.name,
          passed: false,
          score: 0,
          details: `Quality gate validation failed: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }

    return checks;
  }

  /**
   * Run agent-specific validation checks
   */
  private async runAgentSpecificChecks(results: AgentResult[]): Promise<QualityCheckResult[]> {
    const checks: QualityCheckResult[] = [];

    for (const result of results) {
      const agentChecks = await this.runAgentSpecificValidation(result);
      checks.push(...agentChecks);
    }

    return checks;
  }

  /**
   * Run validation specific to each agent type
   */
  private async runAgentSpecificValidation(result: AgentResult): Promise<QualityCheckResult[]> {
    const checks: QualityCheckResult[] = [];

    switch (result.agentId) {
      case 'analytics-specialist':
        checks.push(...this.validateAnalyticsAgent(result));
        break;
      case 'frontend-ux-specialist':
        checks.push(...this.validateFrontendUXAgent(result));
        break;
      case 'collaboration-specialist':
        checks.push(...this.validateCollaborationAgent(result));
        break;
      case 'participant-specialist':
        checks.push(...this.validateParticipantAgent(result));
        break;
      case 'integration-specialist':
        checks.push(...this.validateIntegrationAgent(result));
        break;
      case 'card-sort-specialist':
        checks.push(...this.validateCardSortAgent(result));
        break;
    }

    return checks;
  }

  /**
   * Validate analytics agent results
   */
  private validateAnalyticsAgent(result: AgentResult): QualityCheckResult[] {
    const checks: QualityCheckResult[] = [];

    // Check for statistical validity
    const hasValidStats = result.output && typeof result.output === 'object';
    checks.push({
      checkId: `${result.agentId}-statistical-validity`,
      name: 'Statistical Validity',
      passed: hasValidStats,
      score: hasValidStats ? 100 : 0,
      details: hasValidStats ? 'Statistical output is valid' : 'No valid statistical output found'
    });

    // Check visualization completeness
    const hasVisualizations = result.metadata.resourcesUsed.some(resource =>
      resource.includes('visualization') || resource.includes('d3.js')
    );
    checks.push({
      checkId: `${result.agentId}-visualization-completeness`,
      name: 'Visualization Completeness',
      passed: hasVisualizations,
      score: hasVisualizations ? 100 : 50,
      details: hasVisualizations ? 'Visualizations generated' : 'No visualizations detected'
    });

    return checks;
  }

  /**
   * Validate frontend UX agent results
   */
  private validateFrontendUXAgent(result: AgentResult): QualityCheckResult[] {
    const checks: QualityCheckResult[] = [];

    // Check accessibility compliance
    const hasAccessibilityFeatures = !result.metadata.errors?.some(error =>
      error.toLowerCase().includes('accessibility')
    );
    checks.push({
      checkId: `${result.agentId}-accessibility-compliance`,
      name: 'Accessibility Compliance',
      passed: hasAccessibilityFeatures,
      score: hasAccessibilityFeatures ? 100 : 30,
      details: hasAccessibilityFeatures ? 'No accessibility issues found' : 'Accessibility issues detected'
    });

    // Check mobile responsiveness
    const hasMobileSupport = result.metadata.resourcesUsed.some(resource =>
      resource.includes('responsive') || resource.includes('mobile')
    );
    checks.push({
      checkId: `${result.agentId}-mobile-responsiveness`,
      name: 'Mobile Responsiveness',
      passed: hasMobileSupport,
      score: hasMobileSupport ? 100 : 60,
      details: hasMobileSupport ? 'Mobile support implemented' : 'No mobile optimization detected'
    });

    return checks;
  }

  /**
   * Validate collaboration agent results
   */
  private validateCollaborationAgent(result: AgentResult): QualityCheckResult[] {
    const checks: QualityCheckResult[] = [];

    // Check real-time performance
    const hasGoodPerformance = result.metadata.executionTime < this.config.timeoutThresholds['collaboration-specialist'];
    checks.push({
      checkId: `${result.agentId}-real-time-performance`,
      name: 'Real-time Performance',
      passed: hasGoodPerformance,
      score: hasGoodPerformance ? 100 : Math.max(0, 100 - (result.metadata.executionTime / 100)),
      details: `Execution time: ${result.metadata.executionTime}ms (threshold: ${this.config.timeoutThresholds['collaboration-specialist']}ms)`
    });

    return checks;
  }

  /**
   * Validate participant agent results
   */
  private validateParticipantAgent(result: AgentResult): QualityCheckResult[] {
    const checks: QualityCheckResult[] = [];

    // Check data validation
    const hasDataValidation = !result.metadata.errors?.some(error =>
      error.toLowerCase().includes('validation') || error.toLowerCase().includes('format')
    );
    checks.push({
      checkId: `${result.agentId}-data-validation`,
      name: 'Data Validation',
      passed: hasDataValidation,
      score: hasDataValidation ? 100 : 40,
      details: hasDataValidation ? 'All data validation passed' : 'Data validation errors found'
    });

    return checks;
  }

  /**
   * Validate integration agent results
   */
  private validateIntegrationAgent(result: AgentResult): QualityCheckResult[] {
    const checks: QualityCheckResult[] = [];

    // Check API consistency
    const hasConsistentAPI = result.success && result.metadata.confidence > 0.8;
    checks.push({
      checkId: `${result.agentId}-api-consistency`,
      name: 'API Consistency',
      passed: hasConsistentAPI,
      score: hasConsistentAPI ? 100 : result.metadata.confidence * 100,
      details: `API consistency confidence: ${(result.metadata.confidence * 100).toFixed(1)}%`
    });

    return checks;
  }

  /**
   * Validate card sort agent results
   */
  private validateCardSortAgent(result: AgentResult): QualityCheckResult[] {
    const checks: QualityCheckResult[] = [];

    // Check algorithm correctness
    const hasCorrectAlgorithm = result.success && !result.metadata.errors?.length;
    checks.push({
      checkId: `${result.agentId}-algorithm-correctness`,
      name: 'Algorithm Correctness',
      passed: hasCorrectAlgorithm,
      score: hasCorrectAlgorithm ? 100 : 50,
      details: hasCorrectAlgorithm ? 'Algorithm executed correctly' : 'Algorithm execution issues detected'
    });

    return checks;
  }

  /**
   * Check performance thresholds for all agents
   */
  private async checkPerformanceThresholds(results: AgentResult[]): Promise<QualityCheckResult[]> {
    const checks: QualityCheckResult[] = [];

    for (const result of results) {
      const threshold = this.config.timeoutThresholds[result.agentId] || 10000; // Default 10s
      const withinThreshold = result.metadata.executionTime <= threshold;

      checks.push({
        checkId: `${result.agentId}-performance-threshold`,
        name: `${result.agentId} Performance Threshold`,
        passed: withinThreshold,
        score: withinThreshold ? 100 : Math.max(0, 100 - ((result.metadata.executionTime - threshold) / threshold * 100)),
        details: `Execution time: ${result.metadata.executionTime}ms (threshold: ${threshold}ms)`
      });
    }

    return checks;
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallScore(checks: QualityCheckResult[]): number {
    if (checks.length === 0) return 100;

    const totalScore = checks.reduce((sum, check) => sum + check.score, 0);
    return totalScore / checks.length;
  }

  /**
   * Generate recommendations based on quality check results
   */
  private generateRecommendations(checks: QualityCheckResult[], results: AgentResult[]): string[] {
    const recommendations: string[] = [];

    // Analyze failed checks
    const failedChecks = checks.filter(check => !check.passed);

    if (failedChecks.length > 0) {
      recommendations.push(`Address ${failedChecks.length} failed quality checks`);
    }

    // Agent-specific recommendations
    const lowConfidenceAgents = results.filter(result => result.metadata.confidence < 0.7);
    if (lowConfidenceAgents.length > 0) {
      recommendations.push(`Review output from agents with low confidence: ${lowConfidenceAgents.map(r => r.agentId).join(', ')}`);
    }

    // Performance recommendations
    const slowAgents = results.filter(result => result.metadata.executionTime > 5000);
    if (slowAgents.length > 0) {
      recommendations.push(`Optimize performance for slow agents: ${slowAgents.map(r => r.agentId).join(', ')}`);
    }

    // Error-based recommendations
    const agentsWithErrors = results.filter(result => (result.metadata.errors?.length || 0) > 0);
    if (agentsWithErrors.length > 0) {
      recommendations.push(`Fix errors in agents: ${agentsWithErrors.map(r => r.agentId).join(', ')}`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Quality standards met - no immediate actions required');
    }

    return recommendations;
  }

  /**
   * Check if an agent result is relevant for a quality gate
   */
  private isResultRelevantForGate(result: AgentResult, gate: QualityGate): boolean {
    // Match based on gate ID patterns
    if (gate.id.includes(result.agentId)) return true;

    // Universal gates apply to all results
    const universalGates = ['type-safety', 'performance', 'error-handling'];
    if (universalGates.some(universal => gate.id.includes(universal))) return true;

    return false;
  }
}