/**
 * VUX-Sort Orchestrator Usage Demonstration
 * Shows practical examples of using the orchestrator for different scenarios
 */

import {
  createOrchestrator,
  createSampleTask,
  OrchestratorUtils
} from '../index';
import type { TaskExecutionResult } from '../orchestrator';

export class OrchestratorDemo {
  private orchestrator = createOrchestrator({
    orchestrator: {
      defaultCoordination: 'sequential',
      maxConcurrentAgents: 3,
      qualityGates: true,
      timeoutMs: 300000,
      retryAttempts: 2
    }
  });

  /**
   * Demonstrate basic orchestrator usage
   */
  public async demonstrateBasicUsage(): Promise<void> {
    console.log('🚀 VUX-Sort Orchestrator Basic Usage Demo\n');

    // Example 1: Simple card sorting task
    console.log('📋 Example 1: Simple Card Sorting Task');
    const sortingTask = createSampleTask(
      'Create basic card sorting interface for navigation study',
      ['Drag and drop cards', 'Create categories', 'Save results'],
      'simple'
    );

    const result1 = await this.orchestrator.processTask(sortingTask);
    this.logResult('Card Sorting Task', result1);

    // Example 2: Analytics task
    console.log('\n📊 Example 2: Analytics Task');
    const analyticsTask = OrchestratorUtils.createAnalyticsTask(
      'Generate similarity matrix and clustering analysis',
      ['Statistical processing', 'D3.js visualization', 'Export CSV/JSON']
    );

    const result2 = await this.orchestrator.processTask(analyticsTask);
    this.logResult('Analytics Task', result2);

    // Example 3: UI/UX task
    console.log('\n🎨 Example 3: UI/UX Task');
    const uiTask = OrchestratorUtils.createUITask(
      'Implement responsive and accessible interface',
      ['Mobile optimization', 'WCAG compliance', 'Touch interactions']
    );

    const result3 = await this.orchestrator.processTask(uiTask);
    this.logResult('UI/UX Task', result3);
  }

  /**
   * Demonstrate advanced multi-agent coordination
   */
  public async demonstrateAdvancedCoordination(): Promise<void> {
    console.log('\n🤝 Advanced Multi-Agent Coordination Demo\n');

    // Complex task requiring multiple specialists
    const complexTask = createSampleTask(
      'Build comprehensive IA evaluation platform with real-time collaboration',
      [
        'Multiple sorting methods (open, closed, hybrid)',
        'Real-time collaborative features',
        'Advanced analytics with similarity matrices',
        'Participant management with demographics',
        'Mobile-responsive accessible interface',
        'API integrations for data export',
        'Multi-language support'
      ],
      'complex'
    );

    console.log('🔄 Processing complex multi-agent task...');
    const result = await this.orchestrator.processTask(complexTask);

    console.log('\n📈 Detailed Execution Report:');
    console.log(`Primary Agent: ${result.analysis.primaryAgent}`);
    console.log(`Secondary Agents: ${result.analysis.secondaryAgents.join(', ')}`);
    console.log(`Coordination Pattern: ${result.analysis.coordinationPattern}`);
    console.log(`Risk Level: ${result.analysis.riskLevel}`);
    console.log(`Estimated Effort: ${result.analysis.estimatedEffort}`);
    console.log(`Quality Score: ${result.qualityReport.score.toFixed(1)}%`);
    console.log(`Execution Time: ${result.metrics.executionTime}ms`);

    // Show quality report details
    console.log('\n✅ Quality Assurance Report:');
    result.qualityReport.details.forEach((check: any) => {
      const status = check.passed ? '✅' : '❌';
      console.log(`${status} ${check.name}: ${check.details}`);
    });

    if (result.qualityReport.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      result.qualityReport.recommendations.forEach((rec: any) => {
        console.log(`   • ${rec}`);
      });
    }
  }

  /**
   * Demonstrate real-world development scenarios
   */
  public async demonstrateRealWorldScenarios(): Promise<void> {
    console.log('\n🌍 Real-World Development Scenarios\n');

    const scenarios = [
      {
        name: 'New Feature Development',
        task: createSampleTask(
          'Add tree testing functionality to existing card sorting platform',
          [
            'Implement tree navigation UI',
            'Add task management for tree testing',
            'Create analytics for success rates',
            'Update participant interface',
            'Add data export for tree testing results'
          ],
          'moderate'
        )
      },
      {
        name: 'Bug Fix and Optimization',
        task: createSampleTask(
          'Fix accessibility issues and optimize performance in similarity matrix',
          [
            'ARIA labels for screen readers',
            'Keyboard navigation support',
            'Performance optimization for large datasets',
            'Memory leak fixes',
            'Browser compatibility testing'
          ],
          'moderate'
        )
      },
      {
        name: 'Integration Project',
        task: createSampleTask(
          'Integrate with external research tools and add API endpoints',
          [
            'REST API development',
            'Authentication and authorization',
            'Data synchronization with Maze',
            'Webhook support',
            'Rate limiting and monitoring'
          ],
          'complex'
        )
      },
      {
        name: 'Internationalization',
        task: createSampleTask(
          'Add multi-language support and localization',
          [
            'i18n framework integration',
            'Translation management',
            'RTL language support',
            'Cultural adaptation',
            'Locale-specific date/number formatting'
          ],
          'moderate'
        )
      }
    ];

    for (const scenario of scenarios) {
      console.log(`🔧 Scenario: ${scenario.name}`);
      const result = await this.orchestrator.processTask(scenario.task);

      console.log(`   Primary Agent: ${result.analysis.primaryAgent}`);
      console.log(`   Coordination: ${result.analysis.coordinationPattern}`);
      console.log(`   Success: ${result.success ? '✅' : '❌'}`);
      console.log(`   Duration: ${result.metrics.executionTime}ms`);
      console.log(`   Quality: ${result.qualityReport.score.toFixed(1)}%\n`);
    }
  }

  /**
   * Demonstrate orchestrator monitoring and metrics
   */
  public async demonstrateMonitoring(): Promise<void> {
    console.log('📊 Orchestrator Monitoring and Metrics Demo\n');

    // Process several tasks to generate metrics
    const monitoringTasks = [
      OrchestratorUtils.createAnalyticsTask('Generate user journey analytics'),
      OrchestratorUtils.createUITask('Implement dark mode toggle'),
      OrchestratorUtils.createCollaborationTask('Add live chat support'),
      createSampleTask('Optimize database queries', ['Performance tuning', 'Index optimization']),
      createSampleTask('Add export functionality', ['PDF reports', 'Excel integration'])
    ];

    console.log('⚡ Processing monitoring tasks...');
    for (const task of monitoringTasks) {
      await this.orchestrator.processTask(task);
    }

    // Display overall metrics
    console.log('\n📈 Overall System Metrics:');
    const metrics = this.orchestrator.getMetrics();
    console.log(`Total Tasks Processed: ${metrics.totalTasks}`);
    console.log(`Successful Tasks: ${metrics.successfulTasks}`);
    console.log(`Failed Tasks: ${metrics.failedTasks}`);
    console.log(`Success Rate: ${((metrics.successfulTasks / metrics.totalTasks) * 100).toFixed(1)}%`);
    console.log(`Average Execution Time: ${metrics.averageExecutionTime.toFixed(0)}ms`);

    // Display coordination pattern efficiency
    console.log('\n🔄 Coordination Pattern Efficiency:');
    Object.entries(metrics.coordinationEfficiency).forEach(([pattern, avgTime]) => {
      if (typeof avgTime === 'number' && avgTime > 0) {
        console.log(`   ${pattern}: ${avgTime.toFixed(0)}ms average`);
      }
    });

    // Display agent performance
    console.log('\n🤖 Agent Performance Statistics:');
    const agentPerformance = this.orchestrator.getAgentPerformance();
    Object.entries(agentPerformance).forEach(([agentId, stats]) => {
      if (typeof stats === 'object' && stats !== null && 'totalTasks' in stats) {
        console.log(`   ${agentId}:`);
        console.log(`     Tasks Handled: ${(stats as any).totalTasks}`);
        console.log(`     Success Rate: ${((stats as any).successRate as number).toFixed(1)}%`);
        console.log(`     Avg Execution Time: ${((stats as any).averageExecutionTime as number).toFixed(0)}ms`);
      }
    });

    // Check system health
    console.log('\n🏥 System Health Check:');
    const healthReport = await this.orchestrator.checkSystemHealth();
    console.log(`Overall Status: ${healthReport.overall.toUpperCase()}`);

    Object.entries(healthReport.agents).forEach(([agentId, status]) => {
      if (typeof status === 'object' && status !== null && 'status' in status) {
        const statusIcon = (status as any).status === 'healthy' ? '🟢' :
                          (status as any).status === 'degraded' ? '🟡' : '🔴';
        console.log(`   ${statusIcon} ${agentId}: ${(status as any).status} (${((status as any).successRate as number).toFixed(1)}% success rate)`);
      }
    });
  }

  /**
   * Demonstrate configuration management
   */
  public async demonstrateConfigurationManagement(): Promise<void> {
    console.log('\n⚙️ Configuration Management Demo\n');

    // Show current configuration
    console.log('📋 Current Configuration:');
    const currentMetrics = this.orchestrator.getMetrics();
    console.log(`   Total tasks processed: ${currentMetrics.totalTasks}`);

    // Update configuration for development mode
    console.log('\n🔧 Switching to Development Mode...');
    this.orchestrator.updateConfig({
      orchestrator: {
        maxConcurrentAgents: 1,
        qualityGates: false,
        retryAttempts: 0,
        defaultCoordination: 'sequential',
        timeoutMs: 300000
      },
      agents: {
        'analytics-specialist': {
          timeout: 60000,
          qualityThreshold: 0.5,
          enabled: true,
          priority: 5,
          triggers: ['analytics'],
          maxConcurrency: 1,
          specializations: []
        }
      } as any
    });

    // Test with new configuration
    const devTask = createSampleTask('Development mode test', ['Quick implementation']);
    const devResult = await this.orchestrator.processTask(devTask);
    console.log(`Development task result: ${devResult.success ? '✅' : '❌'}`);

    // Reset to production configuration
    console.log('\n🚀 Switching to Production Mode...');
    this.orchestrator.updateConfig({
      orchestrator: {
        maxConcurrentAgents: 3,
        qualityGates: true,
        retryAttempts: 3,
        defaultCoordination: 'sequential',
        timeoutMs: 300000
      },
      agents: {
        'analytics-specialist': {
          timeout: 30000,
          qualityThreshold: 0.8,
          enabled: true,
          priority: 7,
          triggers: ['analytics'],
          maxConcurrency: 3,
          specializations: []
        }
      } as any
    });

    // Test with production configuration
    const prodTask = createSampleTask('Production mode test', ['High quality implementation']);
    const prodResult = await this.orchestrator.processTask(prodTask);
    console.log(`Production task result: ${prodResult.success ? '✅' : '❌'}`);
    console.log(`Quality score: ${prodResult.qualityReport.score.toFixed(1)}%`);
  }

  /**
   * Run complete demonstration
   */
  public async runFullDemo(): Promise<void> {
    console.log('🎭 VUX-Sort Orchestrator Complete Demonstration\n');
    console.log('=' .repeat(60) + '\n');

    try {
      await this.demonstrateBasicUsage();
      await this.demonstrateAdvancedCoordination();
      await this.demonstrateRealWorldScenarios();
      await this.demonstrateMonitoring();
      await this.demonstrateConfigurationManagement();

      console.log('\n🎉 Demonstration Complete!');
      console.log('The VUX-Sort Orchestrator is ready for production use.');

    } catch (error) {
      console.error('Demo failed:', error);
    }
  }

  private logResult(taskName: string, result: TaskExecutionResult): void {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${taskName}:`);
    console.log(`   Primary Agent: ${result.analysis.primaryAgent}`);
    console.log(`   Coordination: ${result.analysis.coordinationPattern}`);
    console.log(`   Quality Score: ${result.qualityReport.score.toFixed(1)}%`);
    console.log(`   Execution Time: ${result.metrics.executionTime}ms`);
  }
}

// Export demo runner for easy execution
export async function runOrchestratorDemo(): Promise<void> {
  const demo = new OrchestratorDemo();
  await demo.runFullDemo();
}

// Example usage
if (import.meta.main) {
  runOrchestratorDemo().catch(console.error);
}