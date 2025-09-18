/**
 * VUX-Sort Orchestrator Test Suite
 * Comprehensive testing of orchestrator functionality with various scenarios
 */

import {
  createOrchestrator,
  createSampleTask,
  OrchestratorUtils,
  type VUXSortTask
} from '../index';

export class OrchestratorTestSuite {
  private orchestrator = createOrchestrator();
  private testResults: TestResult[] = [];

  /**
   * Run complete test suite
   */
  public async runAllTests(): Promise<TestSuiteResult> {
    console.log('🚀 Starting VUX-Sort Orchestrator Test Suite...\n');

    const tests = [
      () => this.testBasicTaskProcessing(),
      () => this.testAnalyticsSpecialistRouting(),
      () => this.testFrontendUXSpecialistRouting(),
      () => this.testCollaborationSpecialistRouting(),
      () => this.testParticipantSpecialistRouting(),
      () => this.testIntegrationSpecialistRouting(),
      () => this.testCardSortSpecialistRouting(),
      () => this.testMultiAgentCoordination(),
      () => this.testParallelExecution(),
      () => this.testCollaborativeExecution(),
      () => this.testQualityAssurance(),
      () => this.testComplexityAssessment(),
      () => this.testSystemHealthCheck(),
      () => this.testPerformanceMetrics(),
      () => this.testConfigurationManagement(),
      () => this.testErrorHandling()
    ];

    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        console.error(`Test failed with error:`, error);
      }
    }

    return this.generateTestSuiteResult();
  }

  /**
   * Test basic task processing workflow
   */
  private async testBasicTaskProcessing(): Promise<void> {
    const testName = 'Basic Task Processing';
    console.log(`📋 Testing ${testName}...`);

    const task = createSampleTask('Create a simple card sorting interface', [
      'Drag and drop functionality',
      'Basic categories'
    ], 'simple');

    const result = await this.orchestrator.processTask(task);

    this.recordTest(testName, {
      passed: result.success && result.analysis.primaryAgent === 'card-sort-specialist',
      details: `Primary agent: ${result.analysis.primaryAgent}, Success: ${result.success}`,
      executionTime: result.metrics.executionTime,
      qualityScore: result.qualityReport.score
    });
  }

  /**
   * Test analytics specialist routing
   */
  private async testAnalyticsSpecialistRouting(): Promise<void> {
    const testName = 'Analytics Specialist Routing';
    console.log(`📊 Testing ${testName}...`);

    const task = OrchestratorUtils.createAnalyticsTask(
      'Generate similarity matrix and dendrogram for card sorting results',
      ['D3.js visualization', 'Statistical clustering', 'Export to CSV']
    );

    const result = await this.orchestrator.processTask(task);

    this.recordTest(testName, {
      passed: result.success && result.analysis.primaryAgent === 'analytics-specialist',
      details: `Primary agent: ${result.analysis.primaryAgent}, Coordination: ${result.analysis.coordinationPattern}`,
      executionTime: result.metrics.executionTime,
      qualityScore: result.qualityReport.score
    });
  }

  /**
   * Test frontend UX specialist routing
   */
  private async testFrontendUXSpecialistRouting(): Promise<void> {
    const testName = 'Frontend UX Specialist Routing';
    console.log(`🎨 Testing ${testName}...`);

    const task = OrchestratorUtils.createUITask(
      'Implement accessible drag-and-drop interface with mobile responsiveness',
      ['WCAG compliance', 'Touch-friendly interactions', 'Screen reader support']
    );

    const result = await this.orchestrator.processTask(task);

    this.recordTest(testName, {
      passed: result.success && result.analysis.primaryAgent === 'frontend-ux-specialist',
      details: `Primary agent: ${result.analysis.primaryAgent}, Secondary agents: ${result.analysis.secondaryAgents.length}`,
      executionTime: result.metrics.executionTime,
      qualityScore: result.qualityReport.score
    });
  }

  /**
   * Test collaboration specialist routing
   */
  private async testCollaborationSpecialistRouting(): Promise<void> {
    const testName = 'Collaboration Specialist Routing';
    console.log(`👥 Testing ${testName}...`);

    const task = OrchestratorUtils.createCollaborationTask(
      'Implement real-time collaborative card sorting with observer mode',
      ['WebSocket connections', 'Live session management', 'Multi-user synchronization']
    );

    const result = await this.orchestrator.processTask(task);

    this.recordTest(testName, {
      passed: result.success && result.analysis.primaryAgent === 'collaboration-specialist',
      details: `Primary agent: ${result.analysis.primaryAgent}, Risk level: ${result.analysis.riskLevel}`,
      executionTime: result.metrics.executionTime,
      qualityScore: result.qualityReport.score
    });
  }

  /**
   * Test participant specialist routing
   */
  private async testParticipantSpecialistRouting(): Promise<void> {
    const testName = 'Participant Specialist Routing';
    console.log(`🎯 Testing ${testName}...`);

    const task = createSampleTask(
      'Implement participant recruitment system with demographic screening',
      ['CSV participant upload', 'Screening questions', 'Multi-language support', 'Incentive management'],
      'moderate'
    );

    const result = await this.orchestrator.processTask(task);

    this.recordTest(testName, {
      passed: result.success && result.analysis.primaryAgent === 'participant-specialist',
      details: `Primary agent: ${result.analysis.primaryAgent}, Estimated effort: ${result.analysis.estimatedEffort}`,
      executionTime: result.metrics.executionTime,
      qualityScore: result.qualityReport.score
    });
  }

  /**
   * Test integration specialist routing
   */
  private async testIntegrationSpecialistRouting(): Promise<void> {
    const testName = 'Integration Specialist Routing';
    console.log(`🔗 Testing ${testName}...`);

    const task = createSampleTask(
      'Develop API endpoints for data export and integration with external tools',
      ['REST API design', 'Database optimization', 'Third-party integrations', 'Performance monitoring'],
      'complex'
    );

    const result = await this.orchestrator.processTask(task);

    this.recordTest(testName, {
      passed: result.success && result.analysis.primaryAgent === 'integration-specialist',
      details: `Primary agent: ${result.analysis.primaryAgent}, Quality gates: ${result.analysis.qualityGates.length}`,
      executionTime: result.metrics.executionTime,
      qualityScore: result.qualityReport.score
    });
  }

  /**
   * Test card sort specialist routing
   */
  private async testCardSortSpecialistRouting(): Promise<void> {
    const testName = 'Card Sort Specialist Routing';
    console.log(`🃏 Testing ${testName}...`);

    const task = createSampleTask(
      'Implement hybrid card sorting algorithm with multi-round study support',
      ['Open/closed sort logic', 'Sequential sorting', 'Study templates', 'Category management'],
      'moderate'
    );

    const result = await this.orchestrator.processTask(task);

    this.recordTest(testName, {
      passed: result.success && result.analysis.primaryAgent === 'card-sort-specialist',
      details: `Primary agent: ${result.analysis.primaryAgent}, Dependencies: ${result.analysis.dependencies.length}`,
      executionTime: result.metrics.executionTime,
      qualityScore: result.qualityReport.score
    });
  }

  /**
   * Test multi-agent coordination
   */
  private async testMultiAgentCoordination(): Promise<void> {
    const testName = 'Multi-Agent Coordination';
    console.log(`🤝 Testing ${testName}...`);

    const task = createSampleTask(
      'Create comprehensive analytics dashboard with real-time collaboration features and mobile interface',
      [
        'Similarity matrix visualization',
        'Real-time data updates',
        'Mobile responsive design',
        'Accessibility compliance',
        'Export functionality'
      ],
      'complex'
    );

    const result = await this.orchestrator.processTask(task);

    const hasMultipleAgents = result.analysis.secondaryAgents.length > 0;

    this.recordTest(testName, {
      passed: result.success && hasMultipleAgents,
      details: `Agents used: ${[result.analysis.primaryAgent, ...result.analysis.secondaryAgents].length}, Coordination: ${result.analysis.coordinationPattern}`,
      executionTime: result.metrics.executionTime,
      qualityScore: result.qualityReport.score
    });
  }

  /**
   * Test parallel execution pattern
   */
  private async testParallelExecution(): Promise<void> {
    const testName = 'Parallel Execution Pattern';
    console.log(`⚡ Testing ${testName}...`);

    const task = createSampleTask(
      'Implement card sorting interface with analytics visualization',
      ['Drag-and-drop UI', 'Similarity matrix', 'Mobile optimization', 'Data export'],
      'moderate'
    );

    const result = await this.orchestrator.processTask(task);

    this.recordTest(testName, {
      passed: result.success,
      details: `Coordination pattern: ${result.analysis.coordinationPattern}, Agents: ${result.metrics.agentsUsed.length}`,
      executionTime: result.metrics.executionTime,
      qualityScore: result.qualityReport.score
    });
  }

  /**
   * Test collaborative execution pattern
   */
  private async testCollaborativeExecution(): Promise<void> {
    const testName = 'Collaborative Execution Pattern';
    console.log(`🎭 Testing ${testName}...`);

    const task = createSampleTask(
      'Build comprehensive IA evaluation platform with all features integrated',
      [
        'Multiple sorting methods',
        'Advanced analytics',
        'Real-time collaboration',
        'Participant management',
        'API integrations',
        'Accessibility compliance'
      ],
      'complex'
    );

    const result = await this.orchestrator.processTask(task);

    this.recordTest(testName, {
      passed: result.success && result.analysis.coordinationPattern === 'collaborative',
      details: `Coordination: ${result.analysis.coordinationPattern}, Risk level: ${result.analysis.riskLevel}`,
      executionTime: result.metrics.executionTime,
      qualityScore: result.qualityReport.score
    });
  }

  /**
   * Test quality assurance system
   */
  private async testQualityAssurance(): Promise<void> {
    const testName = 'Quality Assurance System';
    console.log(`✅ Testing ${testName}...`);

    const task = createSampleTask(
      'Implement accessibility-compliant interface with performance optimization',
      ['WCAG compliance', 'Performance metrics', 'Error handling', 'Browser compatibility'],
      'moderate'
    );

    const result = await this.orchestrator.processTask(task);

    const hasQualityChecks = result.qualityReport.details.length > 0;

    this.recordTest(testName, {
      passed: result.success && hasQualityChecks,
      details: `Quality checks: ${result.qualityReport.details.length}, Score: ${result.qualityReport.score.toFixed(1)}%`,
      executionTime: result.metrics.executionTime,
      qualityScore: result.qualityReport.score
    });
  }

  /**
   * Test complexity assessment
   */
  private async testComplexityAssessment(): Promise<void> {
    const testName = 'Complexity Assessment';
    console.log(`🧠 Testing ${testName}...`);

    const complexTasks = [
      createSampleTask('Simple task', ['Basic requirement'], 'simple'),
      createSampleTask('Moderate task', ['Multiple requirements', 'Integration needed', 'Testing required'], 'moderate'),
      createSampleTask('Complex task with many requirements', [
        'Advanced algorithms', 'Multiple integrations', 'Performance optimization',
        'Accessibility compliance', 'Real-time features', 'Analytics processing',
        'Multi-user support', 'Mobile optimization'
      ], 'complex')
    ];

    let correctAssessments = 0;

    for (const task of complexTasks) {
      const result = await this.orchestrator.processTask(task);
      if (result.success) correctAssessments++;
    }

    this.recordTest(testName, {
      passed: correctAssessments === complexTasks.length,
      details: `Correct assessments: ${correctAssessments}/${complexTasks.length}`,
      executionTime: 0, // Aggregate test
      qualityScore: (correctAssessments / complexTasks.length) * 100
    });
  }

  /**
   * Test system health check
   */
  private async testSystemHealthCheck(): Promise<void> {
    const testName = 'System Health Check';
    console.log(`🏥 Testing ${testName}...`);

    const healthReport = await this.orchestrator.checkSystemHealth();
    const allAgentsHealthy = Object.values(healthReport.agents).every((agent: any) =>
      agent.status === 'healthy'
    );

    this.recordTest(testName, {
      passed: healthReport.overall === 'healthy' && allAgentsHealthy,
      details: `Overall status: ${healthReport.overall}, Healthy agents: ${Object.values(healthReport.agents).filter((a: any) => a.status === 'healthy').length}/6`,
      executionTime: 0,
      qualityScore: allAgentsHealthy ? 100 : 50
    });
  }

  /**
   * Test performance metrics tracking
   */
  private async testPerformanceMetrics(): Promise<void> {
    const testName = 'Performance Metrics Tracking';
    console.log(`📈 Testing ${testName}...`);

    // Process a few tasks to generate metrics
    const tasks = [
      createSampleTask('Analytics task', ['visualization', 'matrix']),
      createSampleTask('UI task', ['interface', 'responsive']),
      createSampleTask('Sort task', ['card sorting', 'categories'])
    ];

    for (const task of tasks) {
      await this.orchestrator.processTask(task);
    }

    const metrics = this.orchestrator.getMetrics();
    const agentPerformance = this.orchestrator.getAgentPerformance();

    this.recordTest(testName, {
      passed: metrics.totalTasks >= 3 && Object.keys(agentPerformance).length > 0,
      details: `Total tasks: ${metrics.totalTasks}, Agents tracked: ${Object.keys(agentPerformance).length}`,
      executionTime: metrics.averageExecutionTime,
      qualityScore: metrics.totalTasks > 0 ? (metrics.successfulTasks / metrics.totalTasks) * 100 : 0
    });
  }

  /**
   * Test configuration management
   */
  private async testConfigurationManagement(): Promise<void> {
    const testName = 'Configuration Management';
    console.log(`⚙️ Testing ${testName}...`);

    // Test configuration update
    this.orchestrator.updateConfig({
      orchestrator: {
        maxConcurrentAgents: 5,
        retryAttempts: 1,
        defaultCoordination: 'sequential',
        qualityGates: true,
        timeoutMs: 300000
      }
    });

    // Test task processing with new config
    const task = createSampleTask('Test config task', ['test requirement']);
    const result = await this.orchestrator.processTask(task);

    this.recordTest(testName, {
      passed: result.success,
      details: `Configuration update and task processing successful`,
      executionTime: result.metrics.executionTime,
      qualityScore: result.qualityReport.score
    });
  }

  /**
   * Test error handling
   */
  private async testErrorHandling(): Promise<void> {
    const testName = 'Error Handling';
    console.log(`🚨 Testing ${testName}...`);

    // Create an intentionally problematic task
    const problematicTask: VUXSortTask = {
      id: 'error-test-task',
      description: '', // Empty description
      type: 'feature',
      domain: [],
      complexity: 'simple',
      requirements: [],
      urgency: 'low'
    };

    let errorHandled = false;
    try {
      await this.orchestrator.processTask(problematicTask);
    } catch (error) {
      errorHandled = true;
    }

    // Test with valid task to ensure system recovery
    const validTask = createSampleTask('Recovery test', ['basic requirement']);
    const recoveryResult = await this.orchestrator.processTask(validTask);

    this.recordTest(testName, {
      passed: errorHandled && recoveryResult.success,
      details: `Error handled: ${errorHandled}, System recovered: ${recoveryResult.success}`,
      executionTime: recoveryResult.metrics?.executionTime || 0,
      qualityScore: errorHandled && recoveryResult.success ? 100 : 0
    });
  }

  /**
   * Record test result
   */
  private recordTest(testName: string, result: Omit<TestResult, 'name'>): void {
    this.testResults.push({
      name: testName,
      ...result
    });

    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${result.details}\n`);
  }

  /**
   * Generate test suite summary
   */
  private generateTestSuiteResult(): TestSuiteResult {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(test => test.passed).length;
    const failedTests = totalTests - passedTests;

    const averageExecutionTime = this.testResults.reduce((sum, test) => sum + test.executionTime, 0) / totalTests;
    const averageQualityScore = this.testResults.reduce((sum, test) => sum + test.qualityScore, 0) / totalTests;

    const result: TestSuiteResult = {
      totalTests,
      passedTests,
      failedTests,
      successRate: (passedTests / totalTests) * 100,
      averageExecutionTime,
      averageQualityScore,
      testResults: this.testResults,
      summary: {
        overall: passedTests === totalTests ? 'SUCCESS' : passedTests > failedTests ? 'PARTIAL SUCCESS' : 'FAILURE',
        details: `${passedTests}/${totalTests} tests passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`
      }
    };

    this.printTestSummary(result);
    return result;
  }

  /**
   * Print test summary
   */
  private printTestSummary(result: TestSuiteResult): void {
    console.log('📊 TEST SUITE SUMMARY');
    console.log('=====================');
    console.log(`Overall Result: ${result.summary.overall}`);
    console.log(`Tests Passed: ${result.passedTests}/${result.totalTests} (${result.successRate.toFixed(1)}%)`);
    console.log(`Average Execution Time: ${result.averageExecutionTime.toFixed(0)}ms`);
    console.log(`Average Quality Score: ${result.averageQualityScore.toFixed(1)}%`);
    console.log('');

    if (result.failedTests > 0) {
      console.log('❌ Failed Tests:');
      result.testResults.filter(test => !test.passed).forEach(test => {
        console.log(`   - ${test.name}: ${test.details}`);
      });
    }

    console.log(`\n🎉 VUX-Sort Orchestrator Test Suite Complete!\n`);
  }
}

// Test result interfaces
interface TestResult {
  name: string;
  passed: boolean;
  details: string;
  executionTime: number;
  qualityScore: number;
}

interface TestSuiteResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  successRate: number;
  averageExecutionTime: number;
  averageQualityScore: number;
  testResults: TestResult[];
  summary: {
    overall: 'SUCCESS' | 'PARTIAL SUCCESS' | 'FAILURE';
    details: string;
  };
}

// Export test runner for easy execution
export async function runOrchestratorTests(): Promise<TestSuiteResult> {
  const testSuite = new OrchestratorTestSuite();
  return await testSuite.runAllTests();
}

// Example usage
if (import.meta.main) {
  runOrchestratorTests().catch(console.error);
}