import chalk from "chalk";
import { initRepository } from "../lib/git";
import { saveConfig, getDefaultConfig } from "../lib/config";
import { createBackup } from "../lib/backup";
import { existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

interface InitOptions {
  force?: boolean;
}

/**
 * Initialize Git repository in ~/.claude
 * @param options - Command options
 */
export async function init(options: InitOptions = {}): Promise<void> {
  try {
    const claudePath = join(homedir(), ".claude");
    
    // Create backup if ~/.claude already exists
    if (existsSync(claudePath) && !options.force) {
      console.log(chalk.gray("Creating backup of existing configuration..."));
      try {
        const backupPath = await createBackup("pre-init");
        console.log(chalk.gray(`Backup saved to: ${backupPath}`));
      } catch (err) {
        console.log(chalk.yellow("Warning: Could not create backup"));
      }
    }

    if (options.force) {
      console.log(chalk.yellow("Force initializing Git repository..."));
    }

    const initialized = await initRepository();
    
    if (initialized) {
      // Save default configuration
      const config = getDefaultConfig();
      await saveConfig(config);
      
      console.log(`${chalk.green("✓")} Git repository initialized in ~/.claude`);
      console.log(`${chalk.green("✓")} Configuration file created`);
      console.log();
      console.log(chalk.gray("You can now create branches to manage different configurations:"));
      console.log(chalk.cyan("  ccswitch create slim/minimal"));
      console.log(chalk.cyan("  ccswitch create project/web-app"));
      console.log();
      console.log(chalk.gray("Use 'ccswitch list' to see all branches"));
      console.log(chalk.gray("Use 'ccswitch switch <branch>' to switch between configurations"));
    } else {
      console.log(chalk.yellow("Git repository already exists in ~/.claude"));
      console.log(chalk.gray("Use 'ccswitch list' to see existing branches"));
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red(`Error: ${error.message}`));
      
      // Provide helpful suggestions based on error type
      if (error.message.includes("Permission denied")) {
        console.error(chalk.yellow("Try running with appropriate permissions"));
      } else if (error.message.includes("not found")) {
        console.error(chalk.yellow("Make sure Git is installed on your system"));
      }
    } else {
      console.error(chalk.red("Error: Failed to initialize repository"));
    }
  }
}