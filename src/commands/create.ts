import chalk from "chalk";
import { createBranch, getCurrentBranch } from "../lib/git";
import { ConfigLoader } from "../lib/configLoader";
import { HookManager } from "../lib/hookManager";
import type { HookContext } from "../types/config";
import * as path from "path";
import * as os from "os";

/**
 * Validate branch name format
 * @param branchName - Name to validate
 * @returns boolean - true if valid
 */
function isValidBranchName(branchName: string): boolean {
  // Branch name should not contain spaces or special characters except / - _
  const validPattern = /^[a-zA-Z0-9\/_-]+$/;
  return validPattern.test(branchName);
}

/**
 * Create a new Git branch in ~/.claude
 * @param branchName - Name of the branch to create
 */
export async function create(branchName: string): Promise<void> {
  try {
    // Validate branch name
    if (!isValidBranchName(branchName)) {
      console.error(chalk.red("Error: Invalid branch name format"));
      console.error(chalk.yellow("Branch names should only contain letters, numbers, /, -, and _"));
      console.error(chalk.gray("Examples: slim/minimal, project/web-app, persona/frontend"));
      return;
    }

    // 設定ファイルを読み込む
    const configLoader = new ConfigLoader();
    const config = configLoader.loadConfig();
    const hookManager = new HookManager();
    
    // 現在のブランチを取得
    const fromBranch = await getCurrentBranch();
    
    // フック実行コンテキストを準備
    const hookContext: HookContext = {
      command: "create",
      fromBranch: fromBranch,
      toBranch: branchName,
      projectRoot: process.cwd(),
      claudeDir: path.join(os.homedir(), ".claude"),
      timestamp: new Date()
    };
    
    // pre-createフックを実行
    if (config.hooks && hookManager.shouldExecuteHook('preCreate', config.hooks)) {
      const success = await hookManager.executeHook('preCreate', config.hooks, hookContext);
      if (!success) {
        console.error(chalk.red("Pre-create hook failed. Aborting branch creation."));
        return;
      }
    }

    // Create the branch
    await createBranch(branchName);
    
    // post-createフックを実行
    if (config.hooks && hookManager.shouldExecuteHook('postCreate', config.hooks)) {
      await hookManager.executeHook('postCreate', config.hooks, hookContext);
      // post-createフックの失敗は作成自体には影響しない
    }
    
    console.log(`${chalk.green("✓")} Created branch: ${chalk.cyan(branchName)}`);
    console.log(chalk.gray(`Switched to branch '${branchName}'`));
    console.log();
    
    // Show suggested naming conventions if not following them
    if (!branchName.includes("/")) {
      console.log(chalk.gray("Tip: Consider using naming conventions:"));
      console.log(chalk.gray("  • slim/*     - Minimal configurations"));
      console.log(chalk.gray("  • project/*  - Project-specific settings"));
      console.log(chalk.gray("  • client/*   - Client-specific settings"));
      console.log(chalk.gray("  • persona/*  - Persona-focused settings"));
    }
  } catch (error) {
    if (error instanceof Error) {
      // Check if it's a "not a git repository" error
      if (error.message.includes("not a git repository")) {
        console.error(chalk.red("Error: ~/.claude is not a Git repository"));
        console.error(chalk.yellow("Run 'ccswitch init' to initialize Git in ~/.claude"));
      } else if (error.message.includes("already exists")) {
        // Branch already exists error
        console.error(chalk.red(`Error: ${error.message}`));
        console.error(chalk.yellow("Use 'ccswitch switch' to switch to an existing branch"));
      } else {
        console.error(chalk.red(`Error: ${error.message}`));
      }
    } else {
      console.error(chalk.red("Error: Failed to create branch"));
    }
  }
}