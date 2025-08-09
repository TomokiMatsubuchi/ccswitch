import chalk from "chalk";
import { select, confirm } from "@inquirer/prompts";
import { detectProjectType, getProjectFiles } from "../lib/projectDetector";
import { getCurrentBranch, getBranches, switchBranch } from "../lib/git";

interface AutoOptions {
  verbose?: boolean;
  yes?: boolean;
  dryRun?: boolean;
}

/**
 * Automatically detect project type and suggest/switch to appropriate branch
 * @param options - Command options
 */
export async function auto(options: AutoOptions = {}): Promise<void> {
  try {
    console.log(chalk.cyan("🔍 Analyzing project..."));
    console.log();
    
    // Detect project type
    const detection = detectProjectType();
    const currentBranch = await getCurrentBranch();
    
    if (detection.type === "unknown" || detection.confidence < 0.3) {
      console.log(chalk.yellow("⚠️  Could not determine project type with confidence"));
      console.log(chalk.gray("Manual configuration may be required"));
      
      if (options.verbose) {
        const files = getProjectFiles();
        console.log();
        console.log(chalk.gray("Files found in project:"));
        files.slice(0, 10).forEach(file => {
          console.log(chalk.gray(`  - ${file}`));
        });
        if (files.length > 10) {
          console.log(chalk.gray(`  ... and ${files.length - 10} more`));
        }
      }
      return;
    }
    
    // Display detection results
    console.log(chalk.bold.cyan("📊 Project Analysis"));
    console.log(chalk.gray("─".repeat(40)));
    
    const typeDisplay = detection.type.charAt(0).toUpperCase() + detection.type.slice(1);
    console.log(`  Detected project type: ${chalk.green(typeDisplay)}`);
    console.log(`  Confidence: ${chalk.cyan((detection.confidence * 100).toFixed(0) + '%')}`);
    console.log(`  Current branch: ${chalk.yellow(currentBranch)}`);
    
    if (detection.suggestedBranch) {
      console.log(`  Default suggestion: ${chalk.green(detection.suggestedBranch)}`);
    }
    
    if (options.verbose && detection.files.length > 0) {
      console.log();
      console.log(chalk.gray("Detected files:"));
      detection.files.forEach(file => {
        console.log(chalk.gray(`  - ${file}`));
      });
    }
    
    console.log();
    
    // Get suggested branch
    let suggestedBranch = detection.suggestedBranch;
    
    // Check if suggested branch exists
    if (suggestedBranch) {
      const branches = await getBranches();
      const branchExists = branches.includes(suggestedBranch);
      
      // Check if already on the suggested branch
      if (currentBranch === suggestedBranch) {
        console.log(chalk.green("✓ Already on the optimal branch for this project"));
        return;
      }
      
      // Dry run mode
      if (options.dryRun) {
        console.log(chalk.blue("🔵 DRY RUN MODE"));
        console.log(chalk.gray(`Would switch from '${currentBranch}' to '${suggestedBranch}'`));
        console.log(chalk.gray("No changes made"));
        return;
      }
      
      // Auto-confirm with --yes flag
      let shouldSwitch = options.yes;
      
      if (!shouldSwitch) {
        // Ask for confirmation
        if (branchExists) {
          shouldSwitch = await confirm({
            message: `Switch to branch '${suggestedBranch}'?`,
            default: true
          });
        } else {
          const action = await select({
            message: `Branch '${suggestedBranch}' doesn't exist. What would you like to do?`,
            choices: [
              { value: 'create', name: `Create and switch to '${suggestedBranch}'` },
              { value: 'manual', name: 'Select a different branch' },
              { value: 'skip', name: 'Stay on current branch' }
            ]
          });
          
          if (action === 'create') {
            console.log(chalk.yellow(`Branch creation not yet implemented. Use: ccswitch create ${suggestedBranch}`));
            return;
          } else if (action === 'manual') {
            console.log(chalk.gray("Use 'ccswitch switch' to manually select a branch"));
            return;
          } else {
            return;
          }
        }
      }
      
      if (shouldSwitch && branchExists) {
        console.log(chalk.gray(`Switching to branch '${suggestedBranch}'...`));
        await switchBranch(suggestedBranch);
        console.log(chalk.green(`✓ Switched to branch '${suggestedBranch}'`));
      }
    } else {
      console.log(chalk.yellow("No specific branch recommendation for this project type"));
      console.log(chalk.gray("Consider creating a project-specific branch"));
    }
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("User force closed")) {
        console.log(chalk.gray("Cancelled"));
        return;
      }
      console.error(chalk.red(`Error: ${error.message}`));
    } else {
      console.error(chalk.red("Error: Failed to auto-detect project"));
    }
  }
}