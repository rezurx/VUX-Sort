#!/usr/bin/env tsx

import { executePhase1AImplementation, demonstrateTaskRouting } from './src/phase1a-orchestrator';

async function main() {
  try {
    await demonstrateTaskRouting();
    await executePhase1AImplementation();
  } catch (error) {
    console.error('Phase 1A orchestration failed:', error);
    process.exit(1);
  }
}

main();