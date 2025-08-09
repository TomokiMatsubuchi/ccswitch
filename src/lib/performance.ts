import { existsSync, statSync, readdirSync } from "fs";
import { readFile } from "fs/promises";
import { join } from "path";
import { homedir } from "os";

const DEFAULT_CLAUDE_PATH = ".claude";

interface TokenMetrics {
  fileCount: number;
  totalSize: number;
  estimatedTokens: number;
  largestFile: string;
  largestFileSize: number;
}

interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  switchTime: number;
}

interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * Estimate token count based on file size
 * Rough estimate: 1 token ≈ 4 characters
 */
function estimateTokensFromSize(sizeInBytes: number): number {
  return Math.round(sizeInBytes / 4);
}

/**
 * Measure token usage for current configuration
 */
export async function measureTokens(targetPath?: string): Promise<TokenMetrics> {
  const homeDir = process.env.HOME || homedir();
  const claudePath = targetPath || join(homeDir, DEFAULT_CLAUDE_PATH);
  
  if (!existsSync(claudePath)) {
    throw new Error(`~/.claude does not exist`);
  }
  
  let fileCount = 0;
  let totalSize = 0;
  let largestFile = "";
  let largestFileSize = 0;
  
  // Recursively analyze files
  function analyzeDirectory(dirPath: string): void {
    const items = readdirSync(dirPath);
    
    for (const item of items) {
      // Skip .git directory
      if (item === ".git") continue;
      
      const fullPath = join(dirPath, item);
      const stats = statSync(fullPath);
      
      if (stats.isDirectory()) {
        analyzeDirectory(fullPath);
      } else if (stats.isFile()) {
        fileCount++;
        totalSize += stats.size;
        
        if (stats.size > largestFileSize) {
          largestFileSize = stats.size;
          largestFile = item;
        }
      }
    }
  }
  
  analyzeDirectory(claudePath);
  
  return {
    fileCount,
    totalSize,
    estimatedTokens: estimateTokensFromSize(totalSize),
    largestFile,
    largestFileSize
  };
}

/**
 * Measure performance metrics
 */
export async function measurePerformance(targetPath?: string): Promise<PerformanceMetrics> {
  const startTime = Date.now();
  
  // Simulate load time by reading configuration
  const homeDir = process.env.HOME || homedir();
  const claudePath = targetPath || join(homeDir, DEFAULT_CLAUDE_PATH);
  if (existsSync(claudePath)) {
    readdirSync(claudePath);
  }
  
  const loadTime = Date.now() - startTime;
  
  // Get memory usage
  const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // Convert to MB
  
  // Simulate switch time (in real implementation, would measure actual git switch)
  const switchTime = Math.round(loadTime * 1.8); // Estimate switch is slightly slower
  
  return {
    loadTime,
    memoryUsage,
    switchTime
  };
}

/**
 * Validate configuration files
 */
export async function validateConfig(targetPath?: string): Promise<ValidationResult> {
  const homeDir = process.env.HOME || homedir();
  const claudePath = targetPath || join(homeDir, DEFAULT_CLAUDE_PATH);
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Check if directory exists
  if (!existsSync(claudePath)) {
    errors.push("~/.claude directory does not exist");
    return { valid: false, warnings, errors };
  }
  
  // Check for essential files
  const configPath = join(claudePath, ".ccswitchrc");
  if (!existsSync(configPath)) {
    warnings.push("Configuration file .ccswitchrc not found");
  }
  
  // Check file sizes
  try {
    const metrics = await measureTokens(targetPath);
    
    if (metrics.estimatedTokens > 10000) {
      warnings.push("High token usage detected (>10,000 tokens)");
    }
    
    if (metrics.largestFileSize > 50000) {
      warnings.push(`Large file detected: ${metrics.largestFile} (${(metrics.largestFileSize / 1024).toFixed(1)} KB)`);
    }
    
    if (metrics.fileCount > 100) {
      warnings.push(`High file count: ${metrics.fileCount} files`);
    }
  } catch (error) {
    errors.push(`Failed to analyze files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Check for common Claude configuration files
  const claudeConfigFiles = ["CLAUDE.md", "claude.json", ".clauderc"];
  const foundConfigs = claudeConfigFiles.filter(file => 
    existsSync(join(claudePath, file))
  );
  
  if (foundConfigs.length === 0) {
    warnings.push("No Claude configuration files found (CLAUDE.md, claude.json, .clauderc)");
  }
  
  return {
    valid: errors.length === 0,
    warnings,
    errors
  };
}