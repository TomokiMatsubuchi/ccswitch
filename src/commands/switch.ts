import chalk from "chalk";
import { select } from "@inquirer/prompts";
import { switchBranch, getCurrentBranch, getBranches } from "../lib/git";
import { ConfigLoader } from "../lib/configLoader";
import { PresetManager } from "../lib/preset";
import { HookManager } from "../lib/hookManager";
import type { HookContext } from "../types/config";
import * as path from "path";
import * as os from "os";

/**
 * Switch to a different Git branch in ~/.claude interactively
 */
export async function switchInteractive(): Promise<void> {
  try {
    const [branches, currentBranch] = await Promise.all([
      getBranches(),
      getCurrentBranch()
    ]);

    if (branches.length <= 1) {
      console.log(chalk.yellow("No other branches available to switch to"));
      console.log(chalk.gray("Use 'ccswitch create <branch>' to create a new branch"));
      return;
    }

    // Filter out current branch and create choices
    const choices = branches
      .filter(branch => branch !== currentBranch)
      .map(branch => ({
        name: branch,
        value: branch,
        description: branch.startsWith("slim/") ? "Minimal configuration" :
                    branch.startsWith("project/") ? "Project-specific" :
                    branch.startsWith("persona/") ? "Persona-focused" :
                    branch.startsWith("client/") ? "Client-specific" :
                    undefined
      }));

    const selectedBranch = await select({
      message: `Current branch: ${chalk.cyan(currentBranch)}. Select branch to switch to:`,
      choices
    });

    await switchTo(selectedBranch);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("User force closed")) {
        console.log(chalk.gray("Cancelled"));
        return;
      }
      console.error(chalk.red(`Error: ${error.message}`));
    }
  }
}

/**
 * Switch to a different Git branch in ~/.claude
 * @param branchName - Name of the branch to switch to (or alias/preset)
 */
export async function switchTo(branchName: string): Promise<void> {
  try {
    // 設定ファイルを読み込む
    const configLoader = new ConfigLoader();
    const config = configLoader.loadConfig();
    const presetManager = new PresetManager();
    
    // エイリアスを解決
    let targetBranch = configLoader.resolveAlias(branchName, config);
    
    // プリセット名の場合はブランチ名に変換
    const preset = presetManager.getPreset(targetBranch, config);
    if (preset) {
      targetBranch = preset.branch;
      console.log(chalk.gray(`Using preset '${branchName}' -> ${targetBranch}`));
    }
    
    // Get current branch before switching
    const previousBranch = await getCurrentBranch();
    
    // Check if already on the target branch
    if (previousBranch === targetBranch) {
      console.log(chalk.yellow(`Already on branch '${targetBranch}'`));
      return;
    }
    
    // HookManagerのインスタンスを作成
    const hookManager = new HookManager();
    
    // フック実行コンテキストを準備
    const hookContext: HookContext = {
      command: "switch",
      fromBranch: previousBranch,
      toBranch: targetBranch,
      projectRoot: process.cwd(),
      claudeDir: path.join(os.homedir(), ".claude"),
      timestamp: new Date()
    };
    
    // pre-switchフックを実行
    if (config.hooks && hookManager.shouldExecuteHook('preSwitch', config.hooks)) {
      const success = await hookManager.executePreSwitchHook(config.hooks, hookContext);
      if (!success) {
        console.error(chalk.red("Pre-switch hook failed. Aborting switch."));
        return;
      }
    }
    
    // Switch to the new branch
    await switchBranch(targetBranch);
    
    // post-switchフックを実行
    if (config.hooks && hookManager.shouldExecuteHook('postSwitch', config.hooks)) {
      await hookManager.executePostSwitchHook(config.hooks, hookContext);
      // post-switchフックの失敗は切り替え自体には影響しない
    }
    
    console.log(chalk.gray(`Previous branch: ${previousBranch}`));
    console.log(`${chalk.green("Switched to branch:")} ${chalk.cyan(targetBranch)}`);
  } catch (error) {
    if (error instanceof Error) {
      // Check if it's a "not a git repository" error
      if (error.message.includes("not a git repository")) {
        console.error(chalk.red("Error: ~/.claude is not a Git repository"));
        console.error(chalk.yellow("Run 'ccswitch init' to initialize Git in ~/.claude"));
      } else if (error.message.includes("does not exist")) {
        // Branch doesn't exist error
        console.error(chalk.red(`Error: ${error.message}`));
        console.error(chalk.yellow("Run 'ccswitch list' to see available branches"));
      } else {
        console.error(chalk.red(`Error: ${error.message}`));
      }
    } else {
      console.error(chalk.red("Error: Failed to switch branch"));
    }
  }
}