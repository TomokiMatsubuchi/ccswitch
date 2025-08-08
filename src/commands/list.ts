import chalk from "chalk";
import { getBranches, getCurrentBranch } from "../lib/git";

/**
 * Display list of all Git branches for ~/.claude
 */
export async function list(): Promise<void> {
  try {
    const [branches, currentBranch] = await Promise.all([
      getBranches(),
      getCurrentBranch()
    ]);

    if (branches.length === 0) {
      console.log(chalk.yellow("No branches found in ~/.claude"));
      return;
    }

    console.log(chalk.green("Available branches:"));
    
    branches.forEach(branch => {
      if (branch === currentBranch) {
        // Highlight current branch
        console.log(`  ${chalk.cyan("*")} ${chalk.cyan(branch)} ${chalk.gray("(current)")}`);
      } else {
        console.log(`    ${branch}`);
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      // Check if it's a "not a git repository" error
      if (error.message.includes("not a git repository")) {
        console.error(chalk.red("Error: ~/.claude is not a Git repository"));
        console.error(chalk.yellow("Run 'ccswitch init' to initialize Git in ~/.claude"));
      } else {
        console.error(chalk.red(`Error: ${error.message}`));
      }
    } else {
      console.error(chalk.red("Error: Failed to list branches"));
    }
  }
}