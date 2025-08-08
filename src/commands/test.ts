import chalk from "chalk";
import { measureTokens, measurePerformance, validateConfig } from "../lib/performance";
import { getCurrentBranch } from "../lib/git";

interface TestOptions {
  verbose?: boolean;
  branch?: string;
}

/**
 * Run performance test on the current or specified configuration
 * @param options - Command options
 */
export async function testPerformance(options: TestOptions = {}): Promise<void> {
  try {
    const branch = options.branch || await getCurrentBranch();
    
    console.log(chalk.cyan(`🧪 Testing configuration: ${branch}`));
    console.log();

    // Measure token usage
    try {
      const tokenMetrics = await measureTokens();
      
      console.log(chalk.bold.cyan("📊 Token Usage"));
      console.log(chalk.gray("─".repeat(40)));
      
      if (options.verbose) {
        console.log(`  File count: ${tokenMetrics.fileCount}`);
        console.log(`  Total size: ${(tokenMetrics.totalSize / 1024).toFixed(2)} KB`);
        console.log(`  Largest file: ${tokenMetrics.largestFile}`);
      }
      
      // Color code based on token count
      const tokenColor = tokenMetrics.estimatedTokens > 10000 ? chalk.red :
                        tokenMetrics.estimatedTokens > 5000 ? chalk.yellow :
                        chalk.green;
      
      console.log(`  Estimated tokens: ${tokenColor(tokenMetrics.estimatedTokens.toLocaleString())}`);
      
      if (tokenMetrics.estimatedTokens > 10000) {
        console.log(chalk.yellow("  ⚠️  Warning: HIGH token usage detected"));
      }
    } catch (error) {
      console.error(chalk.red(`  Error measuring tokens: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
    
    console.log();

    // Measure performance metrics
    try {
      const perfMetrics = await measurePerformance();
      
      console.log(chalk.bold.cyan("⚡ Performance Metrics"));
      console.log(chalk.gray("─".repeat(40)));
      
      const loadColor = perfMetrics.loadTime > 100 ? chalk.red :
                       perfMetrics.loadTime > 50 ? chalk.yellow :
                       chalk.green;
      
      console.log(`  Load time: ${loadColor(perfMetrics.loadTime + 'ms')}`);
      console.log(`  Memory usage: ${perfMetrics.memoryUsage.toFixed(1)} MB`);
      console.log(`  Switch time: ${perfMetrics.switchTime}ms`);
    } catch (error) {
      console.error(chalk.red(`  Error measuring performance: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
    
    console.log();

    // Validate configuration
    try {
      const validation = await validateConfig();
      
      console.log(chalk.bold.cyan("✅ Configuration Validation"));
      console.log(chalk.gray("─".repeat(40)));
      
      if (validation.valid) {
        console.log(chalk.green("  Configuration is valid"));
      } else {
        console.log(chalk.red("  Configuration has errors"));
      }
      
      if (validation.warnings.length > 0) {
        console.log(chalk.yellow(`  Warnings: ${validation.warnings.length}`));
        if (options.verbose) {
          validation.warnings.forEach(warning => {
            console.log(chalk.yellow(`    - ${warning}`));
          });
        }
      }
      
      if (validation.errors.length > 0) {
        console.log(chalk.red(`  Errors: ${validation.errors.length}`));
        validation.errors.forEach(error => {
          console.log(chalk.red(`    - ${error}`));
        });
      }
    } catch (error) {
      console.error(chalk.red(`  Error validating config: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
    
    console.log();
    console.log(chalk.gray("Test completed"));
    
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Error: ${error.message}`));
    } else {
      console.error(chalk.red("Error: Failed to run performance test"));
    }
  }
}