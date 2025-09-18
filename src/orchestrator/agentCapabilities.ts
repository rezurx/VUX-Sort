/**
 * Agent Capabilities Registry
 * Defines the expertise, triggers, and coordination patterns for each specialized agent
 */

import type { AgentCapability, SpecialtyDomain } from './types';

export const AGENT_CAPABILITIES: Record<SpecialtyDomain, AgentCapability> = {
  'card-sort-specialist': {
    domain: 'card-sort-specialist',
    primarySkills: [
      'sort-algorithm-optimization',
      'study-configuration',
      'category-management',
      'participant-flow-coordination',
      'multi-round-studies',
      'sequential-staged-sorting'
    ],
    secondarySkills: [
      'basic-analytics',
      'participant-interface',
      'data-validation',
      'study-templates'
    ],
    triggers: [
      'open card sort',
      'closed card sort',
      'hybrid sort',
      'sort algorithm',
      'category management',
      'study configuration',
      'participant flow',
      'multi-round',
      'sequential sorting',
      'staged sorting',
      'group sorting',
      'individual sorting',
      'sort logic'
    ],
    collaboratesWith: ['analytics-specialist', 'participant-specialist', 'frontend-ux-specialist'],
    maxConcurrency: 2
  },

  'analytics-specialist': {
    domain: 'analytics-specialist',
    primarySkills: [
      'similarity-matrix-generation',
      'dendrogram-creation',
      'statistical-analysis',
      'data-visualization',
      'agreement-score-calculations',
      'cross-study-comparison',
      'automatic-insight-generation'
    ],
    secondarySkills: [
      'data-export',
      'report-generation',
      'performance-metrics',
      'trend-analysis'
    ],
    triggers: [
      'analytics',
      'similarity matrix',
      'dendrogram',
      'heatmap',
      'agreement score',
      'statistical analysis',
      'visualization',
      'reporting',
      'insights',
      'clustering',
      'correlation',
      'frequency analysis',
      'cross-study comparison',
      'd3.js',
      'chart',
      'graph'
    ],
    collaboratesWith: ['card-sort-specialist', 'integration-specialist'],
    maxConcurrency: 3
  },

  'collaboration-specialist': {
    domain: 'collaboration-specialist',
    primarySkills: [
      'real-time-communication',
      'live-session-orchestration',
      'multi-user-coordination',
      'observer-mode-implementation',
      'commenting-annotation-systems',
      'role-permission-management'
    ],
    secondarySkills: [
      'websocket-management',
      'chat-systems',
      'video-integration',
      'team-workflows'
    ],
    triggers: [
      'collaboration',
      'real-time',
      'live session',
      'observer mode',
      'commenting',
      'annotation',
      'team',
      'multi-user',
      'websocket',
      'chat',
      'voice',
      'video recording',
      'moderated session',
      'stakeholder',
      'permission',
      'roles'
    ],
    collaboratesWith: ['participant-specialist', 'frontend-ux-specialist'],
    maxConcurrency: 2
  },

  'participant-specialist': {
    domain: 'participant-specialist',
    primarySkills: [
      'participant-recruitment',
      'screening-question-logic',
      'demographic-management',
      'multi-language-support',
      'incentive-payment-processing',
      'user-onboarding-flows'
    ],
    secondarySkills: [
      'csv-upload-processing',
      'email-management',
      'localization',
      'accessibility-compliance'
    ],
    triggers: [
      'participant',
      'recruitment',
      'screening',
      'demographic',
      'multi-language',
      'localization',
      'i18n',
      'incentive',
      'payment',
      'onboarding',
      'csv upload',
      'email',
      'bulk participant',
      'participant panel',
      'recruitment panel'
    ],
    collaboratesWith: ['collaboration-specialist', 'frontend-ux-specialist'],
    maxConcurrency: 2
  },

  'frontend-ux-specialist': {
    domain: 'frontend-ux-specialist',
    primarySkills: [
      'react-component-architecture',
      'drag-drop-interface',
      'accessibility-compliance',
      'mobile-responsive-design',
      'touch-friendly-interactions',
      'css-styling-systems'
    ],
    secondarySkills: [
      'animation-systems',
      'theme-management',
      'component-library',
      'design-tokens'
    ],
    triggers: [
      'interface',
      'drag and drop',
      'accessibility',
      'mobile',
      'responsive',
      'touch',
      'styling',
      'css',
      'component',
      'react',
      'ui',
      'ux',
      'animation',
      'theme',
      'design',
      'wcag',
      'keyboard navigation',
      'screen reader'
    ],
    collaboratesWith: ['card-sort-specialist', 'participant-specialist'],
    maxConcurrency: 2
  },

  'integration-specialist': {
    domain: 'integration-specialist',
    primarySkills: [
      'api-endpoint-development',
      'database-schema-optimization',
      'external-service-integrations',
      'data-pipeline-architecture',
      'performance-optimization',
      'system-architecture'
    ],
    secondarySkills: [
      'caching-strategies',
      'load-balancing',
      'monitoring-logging',
      'security-implementation'
    ],
    triggers: [
      'api',
      'database',
      'integration',
      'export',
      'import',
      'performance',
      'optimization',
      'architecture',
      'backend',
      'third-party',
      'external service',
      'maze integration',
      'optimal workshop',
      'data pipeline',
      'system design',
      'scalability'
    ],
    collaboratesWith: ['analytics-specialist'],
    maxConcurrency: 2
  }
};

/**
 * Get triggers for a specific agent domain
 */
export function getAgentTriggers(domain: SpecialtyDomain): string[] {
  return AGENT_CAPABILITIES[domain]?.triggers || [];
}

/**
 * Get all agents that can collaborate with a given agent
 */
export function getCollaboratingAgents(domain: SpecialtyDomain): SpecialtyDomain[] {
  return AGENT_CAPABILITIES[domain]?.collaboratesWith || [];
}

/**
 * Check if two agents can work together
 */
export function canAgentsCollaborate(agent1: SpecialtyDomain, agent2: SpecialtyDomain): boolean {
  const agent1Collaborators = getCollaboratingAgents(agent1);
  const agent2Collaborators = getCollaboratingAgents(agent2);

  return agent1Collaborators.includes(agent2) || agent2Collaborators.includes(agent1);
}

/**
 * Get maximum concurrent tasks for an agent
 */
export function getAgentConcurrency(domain: SpecialtyDomain): number {
  return AGENT_CAPABILITIES[domain]?.maxConcurrency || 1;
}