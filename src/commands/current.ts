import chalk from "chalk";
import { getCurrentBranch } from "../lib/git";

/**
 * Display the current Git branch for ~/.claude
 */
export async function current(): Promise<void> {
  try {
    const branch = await getCurrentBranch();
    console.log(`${chalk.green("Current branch:")} ${chalk.cyan(branch)}`);
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
      console.error(chalk.red("Error: Failed to get current branch"));
    }
  }
}