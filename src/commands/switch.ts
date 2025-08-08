import chalk from "chalk";
import { select } from "@inquirer/prompts";
import { switchBranch, getCurrentBranch, getBranches } from "../lib/git";

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