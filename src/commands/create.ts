import chalk from "chalk";
import { createBranch } from "../lib/git";
import { openInIDE, detectIDE, getIDEDisplayName } from "../lib/ide";
import * as os from "os";
import * as path from "path";

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

interface CreateOptions {
  openInIDE?: boolean;
}

/**
 * Create a new Git branch in ~/.claude
 * @param branchName - Name of the branch to create
 * @param options - Options for the create command
 */
export async function create(branchName: string, options: CreateOptions = {}): Promise<void> {
  try {
    // Validate branch name
    if (!isValidBranchName(branchName)) {
      console.error(chalk.red("Error: Invalid branch name format"));
      console.error(chalk.yellow("Branch names should only contain letters, numbers, /, -, and _"));
      console.error(chalk.gray("Examples: slim/minimal, project/web-app, persona/frontend"));
      return;
    }

    // Create the branch
    await createBranch(branchName);
    
    console.log(`${chalk.green("✓")} Created branch: ${chalk.cyan(branchName)}`);
    console.log(chalk.gray(`Switched to branch '${branchName}'`));
    console.log();
    
    // Open in IDE if requested (default is true)
    if (options.openInIDE !== false) {
      try {
        const claudeDir = path.join(os.homedir(), ".claude");
        const ide = await detectIDE();
        
        if (ide) {
          console.log(chalk.cyan(`Opening ~/.claude in ${getIDEDisplayName(ide)}...`));
          await openInIDE(claudeDir);
          console.log(chalk.green("✓") + " Opened ~/.claude in your IDE");
        } else {
          console.log(chalk.yellow("No IDE found. You can manually open ~/.claude to edit your configuration."));
        }
      } catch (ideError) {
        // Don't fail the entire command if IDE opening fails
        console.log(chalk.yellow("Could not open IDE automatically. You can manually open ~/.claude to edit your configuration."));
      }
    }
    
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