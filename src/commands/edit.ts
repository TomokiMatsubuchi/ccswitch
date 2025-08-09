import chalk from "chalk";
import * as os from "os";
import * as path from "path";
import { openInIDE, detectIDE, getIDEDisplayName } from "../lib/ide";
import { switchBranch } from "../lib/git";

/**
 * Open ~/.claude directory in IDE, optionally switching to a specific branch first
 * @param branchName - Optional branch name to switch to before opening IDE
 */
export async function edit(branchName?: string): Promise<void> {
  try {
    const claudeDir = path.join(os.homedir(), ".claude");
    
    // If branch name is provided, switch to it first
    if (branchName) {
      console.log(chalk.cyan(`Switching to branch: ${branchName}`));
      await switchBranch(branchName);
      console.log(chalk.green("✓") + ` Switched to branch: ${chalk.cyan(branchName)}`);
      console.log();
    }
    
    // Detect which IDE will be used
    const ide = await detectIDE();
    if (ide) {
      console.log(chalk.cyan(`Opening ${chalk.bold.cyan("~/.claude")} in ${getIDEDisplayName(ide)}...`));
    }
    
    // Open the directory
    await openInIDE(claudeDir);
    
    console.log(chalk.green("✓") + " Opened ~/.claude in your IDE");
    if (branchName) {
      console.log(chalk.gray(`You can now edit your Claude configuration files on branch '${branchName}'`));
    } else {
      console.log(chalk.gray("You can now edit your Claude configuration files"));
    }
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Directory not found")) {
        console.error(chalk.red("Error: ~/.claude directory does not exist"));
        console.error(chalk.yellow("Run 'ccswitch init' to create the directory first"));
      } else if (error.message.includes("No IDE found")) {
        console.error(chalk.red("Error: No suitable text editor found"));
        console.error(chalk.yellow("Please install VS Code, Cursor, or another text editor"));
        console.error(chalk.gray("VS Code: https://code.visualstudio.com/"));
        console.error(chalk.gray("Cursor: https://cursor.sh/"));
      } else if (error.message.includes("Permission")) {
        console.error(chalk.red("Error: Permission denied accessing ~/.claude"));
        console.error(chalk.yellow("Please check your directory permissions"));
      } else if (error.message.includes("does not exist")) {
        // Branch doesn't exist error
        console.error(chalk.red(`Error: ${error.message}`));
        console.error(chalk.yellow("Run 'ccswitch list' to see available branches"));
      } else {
        console.error(chalk.red(`Error: ${error.message}`));
      }
    } else {
      console.error(chalk.red("Error: Failed to open IDE"));
    }
  }
}