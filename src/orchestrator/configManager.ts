/**
 * Configuration Manager - Handles orchestrator configuration and runtime updates
 * Manages agent settings, coordination patterns, and quality thresholds
 */

import type {
  OrchestratorConfig,
  AgentConfig,
  SpecialtyDomain
} from './types';
import type { QualityConfig } from './qualityAssurance';

export class ConfigManager {
  private config: OrchestratorConfig;
  private defaultConfig: OrchestratorConfig;

  constructor(initialConfig?: Partial<OrchestratorConfig>) {
    this.defaultConfig = this.createDefaultConfig();
    this.config = this.mergeConfigs(this.defaultConfig, initialConfig || {});
  }

  /**
   * Get current orchestrator configuration
   */
  public getConfig(): OrchestratorConfig {
    return { ...this.config };
  }

  /**
   * Update configuration at runtime
   */
  public updateConfig(configUpdate: Partial<OrchestratorConfig>): void {
    this.config = this.mergeConfigs(this.config, configUpdate);
    console.log('[ConfigManager] Configuration updated:', configUpdate);
  }

  /**
   * Get agent-specific configuration
   */
  public getAgentConfig(agent: SpecialtyDomain): AgentConfig {
    return { ...this.config.agents[agent] };
  }

  /**
   * Update agent configuration
   */
  public updateAgentConfig(agent: SpecialtyDomain, agentConfig: Partial<AgentConfig>): void {
    this.config.agents[agent] = {
      ...this.config.agents[agent],
      ...agentConfig
    };
    console.log(`[ConfigManager] Agent ${agent} configuration updated:`, agentConfig);
  }

  /**
   * Get quality assurance configuration
   */
  public getQualityConfig(): QualityConfig {
    return {
      enableQualityGates: this.config.orchestrator.qualityGates,
      minimumQualityScore: 70, // Could be configurable
      requireAllGatesToPass: false,
      agentSpecificValidation: true,
      timeoutThresholds: this.getTimeoutThresholds()
    };
  }

  /**
   * Get routing configuration
   */
  public getRoutingConfig() {
    return { ...this.config.routing };
  }

  /**
   * Enable or disable an agent
   */
  public setAgentEnabled(agent: SpecialtyDomain, enabled: boolean): void {
    this.config.agents[agent].enabled = enabled;
    console.log(`[ConfigManager] Agent ${agent} ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Set agent priority
   */
  public setAgentPriority(agent: SpecialtyDomain, priority: number): void {
    this.config.agents[agent].priority = priority;
    console.log(`[ConfigManager] Agent ${agent} priority set to ${priority}`);
  }

  /**
   * Get enabled agents sorted by priority
   */
  public getEnabledAgents(): SpecialtyDomain[] {
    return Object.entries(this.config.agents)
      .filter(([_, config]) => config.enabled)
      .sort(([_, a], [__, b]) => b.priority - a.priority)
      .map(([agent, _]) => agent as SpecialtyDomain);
  }

  /**
   * Reset configuration to defaults
   */
  public resetToDefaults(): void {
    this.config = { ...this.defaultConfig };
    console.log('[ConfigManager] Configuration reset to defaults');
  }

  /**
   * Validate configuration
   */
  public validateConfig(): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Validate orchestrator configuration
    if (this.config.orchestrator.maxConcurrentAgents < 1) {
      issues.push('Maximum concurrent agents must be at least 1');
    }

    if (this.config.orchestrator.timeoutMs < 1000) {
      warnings.push('Timeout less than 1000ms may cause frequent timeouts');
    }

    if (this.config.orchestrator.retryAttempts < 0) {
      issues.push('Retry attempts cannot be negative');
    }

    // Validate agent configurations
    Object.entries(this.config.agents).forEach(([agentId, agentConfig]) => {
      if (agentConfig.maxConcurrency < 1) {
        issues.push(`Agent ${agentId} maxConcurrency must be at least 1`);
      }

      if (agentConfig.timeout < 100) {
        warnings.push(`Agent ${agentId} timeout is very low (${agentConfig.timeout}ms)`);
      }

      if (agentConfig.qualityThreshold < 0 || agentConfig.qualityThreshold > 1) {
        issues.push(`Agent ${agentId} quality threshold must be between 0 and 1`);
      }

      if (!agentConfig.triggers || agentConfig.triggers.length === 0) {
        warnings.push(`Agent ${agentId} has no triggers defined`);
      }
    });

    // Validate routing configuration
    if (Object.keys(this.config.routing.keywordWeights).length === 0) {
      warnings.push('No keyword weights defined for routing');
    }

    const enabledAgents = this.getEnabledAgents();
    if (enabledAgents.length === 0) {
      issues.push('At least one agent must be enabled');
    }

    return {
      valid: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Export configuration for backup/sharing
   */
  public exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  public importConfig(configJson: string): boolean {
    try {
      const importedConfig = JSON.parse(configJson);
      const mergedConfig = this.mergeConfigs(this.defaultConfig, importedConfig);

      // Validate before applying
      const tempConfig = this.config;
      this.config = mergedConfig;
      const validation = this.validateConfig();

      if (!validation.valid) {
        this.config = tempConfig; // Rollback
        console.error('[ConfigManager] Import failed - validation errors:', validation.issues);
        return false;
      }

      console.log('[ConfigManager] Configuration imported successfully');
      if (validation.warnings.length > 0) {
        console.warn('[ConfigManager] Import warnings:', validation.warnings);
      }

      return true;
    } catch (error) {
      console.error('[ConfigManager] Failed to import configuration:', error);
      return false;
    }
  }

  /**
   * Create performance profile configurations
   */
  public applyPerformanceProfile(profile: 'development' | 'production' | 'testing'): void {
    switch (profile) {
      case 'development':
        this.applyDevelopmentProfile();
        break;
      case 'production':
        this.applyProductionProfile();
        break;
      case 'testing':
        this.applyTestingProfile();
        break;
    }
    console.log(`[ConfigManager] Applied ${profile} performance profile`);
  }

  // Private helper methods

  private createDefaultConfig(): OrchestratorConfig {
    const defaultAgentConfig: AgentConfig = {
      enabled: true,
      priority: 5,
      triggers: [],
      maxConcurrency: 2,
      timeout: 30000, // 30 seconds
      qualityThreshold: 0.7,
      specializations: []
    };

    return {
      agents: {
        'card-sort-specialist': {
          ...defaultAgentConfig,
          priority: 8,
          triggers: ['sort', 'card', 'category', 'study', 'algorithm'],
          specializations: ['sorting-algorithms', 'study-configuration', 'participant-flow']
        },
        'analytics-specialist': {
          ...defaultAgentConfig,
          priority: 7,
          maxConcurrency: 3,
          timeout: 45000, // Analytics may take longer
          triggers: ['analytics', 'visualization', 'matrix', 'dendrogram', 'statistics'],
          specializations: ['data-analysis', 'visualizations', 'statistical-processing']
        },
        'collaboration-specialist': {
          ...defaultAgentConfig,
          priority: 6,
          timeout: 20000, // Real-time features need fast response
          triggers: ['collaboration', 'real-time', 'live', 'observer', 'team'],
          specializations: ['real-time-features', 'multi-user-coordination', 'live-sessions']
        },
        'participant-specialist': {
          ...defaultAgentConfig,
          priority: 6,
          triggers: ['participant', 'recruitment', 'demographic', 'screening', 'incentive'],
          specializations: ['user-management', 'recruitment', 'demographics', 'localization']
        },
        'frontend-ux-specialist': {
          ...defaultAgentConfig,
          priority: 7,
          triggers: ['interface', 'ui', 'ux', 'accessibility', 'mobile', 'responsive'],
          specializations: ['react-components', 'accessibility', 'responsive-design', 'user-experience']
        },
        'integration-specialist': {
          ...defaultAgentConfig,
          priority: 5,
          timeout: 60000, // Integration may involve external services
          triggers: ['api', 'integration', 'export', 'database', 'external'],
          specializations: ['api-development', 'data-integration', 'external-services', 'system-architecture']
        }
      },
      orchestrator: {
        defaultCoordination: 'sequential',
        maxConcurrentAgents: 3,
        qualityGates: true,
        timeoutMs: 300000, // 5 minutes total
        retryAttempts: 2
      },
      routing: {
        keywordWeights: {
          'analytics': 2.0,
          'real-time': 2.0,
          'collaboration': 1.8,
          'accessibility': 1.8,
          'integration': 1.5,
          'visualization': 1.5,
          'drag and drop': 1.5,
          'mobile': 1.3,
          'responsive': 1.3,
          'sort': 1.2,
          'card': 1.2,
          'participant': 1.2
        },
        domainPriorities: {
          'analytics-specialist': 8,
          'card-sort-specialist': 8,
          'frontend-ux-specialist': 7,
          'collaboration-specialist': 6,
          'participant-specialist': 6,
          'integration-specialist': 5
        },
        complexityThresholds: {
          simple: 3,
          moderate: 8,
          complex: 15
        }
      }
    };
  }

  private mergeConfigs(base: OrchestratorConfig, override: Partial<OrchestratorConfig>): OrchestratorConfig {
    const merged = { ...base };

    if (override.agents) {
      merged.agents = { ...base.agents };
      Object.entries(override.agents).forEach(([agentId, agentConfig]) => {
        merged.agents[agentId as SpecialtyDomain] = {
          ...base.agents[agentId as SpecialtyDomain],
          ...agentConfig
        };
      });
    }

    if (override.orchestrator) {
      merged.orchestrator = {
        ...base.orchestrator,
        ...override.orchestrator
      };
    }

    if (override.routing) {
      merged.routing = {
        ...base.routing,
        ...override.routing
      };
    }

    return merged;
  }

  private getTimeoutThresholds(): Record<SpecialtyDomain, number> {
    const thresholds: Record<SpecialtyDomain, number> = {} as any;

    Object.entries(this.config.agents).forEach(([agentId, agentConfig]) => {
      thresholds[agentId as SpecialtyDomain] = agentConfig.timeout;
    });

    return thresholds;
  }

  private applyDevelopmentProfile(): void {
    // Relaxed timeouts and quality for faster development
    Object.keys(this.config.agents).forEach(agentId => {
      const agent = agentId as SpecialtyDomain;
      this.config.agents[agent].timeout *= 2; // Double timeouts
      this.config.agents[agent].qualityThreshold = 0.5; // Lower quality threshold
    });

    this.config.orchestrator.timeoutMs = 600000; // 10 minutes
    this.config.orchestrator.retryAttempts = 1; // Fewer retries for faster feedback
  }

  private applyProductionProfile(): void {
    // Strict timeouts and quality for production
    Object.keys(this.config.agents).forEach(agentId => {
      const agent = agentId as SpecialtyDomain;
      this.config.agents[agent].timeout = Math.min(this.config.agents[agent].timeout, 30000); // Max 30s
      this.config.agents[agent].qualityThreshold = 0.8; // Higher quality threshold
    });

    this.config.orchestrator.timeoutMs = 180000; // 3 minutes
    this.config.orchestrator.retryAttempts = 3; // More retries for reliability
    this.config.orchestrator.qualityGates = true;
  }

  private applyTestingProfile(): void {
    // Fast execution with minimal quality checks for testing
    Object.keys(this.config.agents).forEach(agentId => {
      const agent = agentId as SpecialtyDomain;
      this.config.agents[agent].timeout = 10000; // 10s timeout
      this.config.agents[agent].qualityThreshold = 0.3; // Low quality threshold
    });

    this.config.orchestrator.timeoutMs = 60000; // 1 minute
    this.config.orchestrator.retryAttempts = 0; // No retries for fast testing
    this.config.orchestrator.qualityGates = false; // Skip quality gates
  }
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  warnings: string[];
}