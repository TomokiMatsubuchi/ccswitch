/**
 * Core type definitions for ccswitch
 */

export interface GitBranch {
  name: string;
  current: boolean;
}

export interface CommandOptions {
  verbose?: boolean;
  quiet?: boolean;
}

export interface SwitchOptions extends CommandOptions {
  force?: boolean;
  backup?: boolean;
}

export interface TestResult {
  branch: string;
  tokenCount: number;
  startupTime: number;
  memoryUsage: number;
}