import chalk from "chalk";
import { select } from "@inquirer/prompts";
import { switchBranch, getCurrentBranch, getBranches } from "../lib/git";
import { ConfigLoader } from "../lib/configLoader";
import { PresetManager } from "../lib/preset";

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
    
    // フック実行（pre-switch）
    if (config.hooks?.preSwitch) {
      console.log(chalk.gray("Running pre-switch hook..."));
      const { exec } = await import("child_process");
      await new Promise((resolve, reject) => {
        exec(config.hooks.preSwitch!, (error) => {
          if (error) reject(error);
          else resolve(undefined);
        });
      });
    }
    
    // Switch to the new branch
    await switchBranch(targetBranch);
    
    // フック実行（post-switch）
    if (config.hooks?.postSwitch) {
      console.log(chalk.gray("Running post-switch hook..."));
      const { exec } = await import("child_process");
      await new Promise((resolve, reject) => {
        exec(config.hooks.postSwitch!, (error) => {
          if (error) reject(error);
          else resolve(undefined);
        });
      });
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