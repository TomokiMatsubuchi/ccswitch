import chalk from "chalk";
import { switchBranch, getCurrentBranch } from "../lib/git";

/**
 * Switch to a different Git branch in ~/.claude
 * @param branchName - Name of the branch to switch to
 */
export async function switchTo(branchName: string): Promise<void> {
  try {
    // Get current branch before switching
    const previousBranch = await getCurrentBranch();
    
    // Check if already on the target branch
    if (previousBranch === branchName) {
      console.log(chalk.yellow(`Already on branch '${branchName}'`));
      return;
    }
    
    // Switch to the new branch
    await switchBranch(branchName);
    
    console.log(chalk.gray(`Previous branch: ${previousBranch}`));
    console.log(`${chalk.green("Switched to branch:")} ${chalk.cyan(branchName)}`);
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