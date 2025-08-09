import chalk from "chalk";
import { initRepository } from "../lib/git";
import { saveConfig, getDefaultConfig } from "../lib/config";
import { createBackup } from "../lib/backup";
import { existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// Conditionally import ora only in non-test environment
let ora: any;
if (process.env.NODE_ENV !== 'test') {
  ora = require('ora');
}

interface InitOptions {
  force?: boolean;
}

/**
 * Initialize Git repository in ~/.claude
 * @param options - Command options
 */
export async function init(options: InitOptions = {}): Promise<void> {
  try {
    const homeDir = process.env.HOME || homedir();
    const claudePath = join(homeDir, ".claude");
    
    // Create backup if ~/.claude already exists
    if (existsSync(claudePath) && !options.force) {
      if (ora) {
        const backupSpinner = ora("Creating backup of existing configuration...").start();
        try {
          const backupPath = await createBackup("pre-init");
          backupSpinner.succeed(`Backup saved to: ${backupPath}`);
        } catch (err) {
          backupSpinner.warn("Could not create backup");
        }
      } else {
        console.log(chalk.gray("Creating backup of existing configuration..."));
        try {
          const backupPath = await createBackup("pre-init");
          console.log(chalk.gray(`Backup saved to: ${backupPath}`));
        } catch (err) {
          console.log(chalk.yellow("Warning: Could not create backup"));
        }
      }
    }

    if (options.force) {
      console.log(chalk.yellow("Force initializing Git repository..."));
    }

    const initSpinner = ora ? ora("Initializing Git repository in ~/.claude...").start() : null;
    if (!ora) console.log(chalk.gray("Initializing Git repository in ~/.claude..."));
    
    const initialized = await initRepository();
    
    if (initialized) {
      if (ora && initSpinner) {
        initSpinner.succeed("Git repository initialized in ~/.claude");
      } else {
        console.log(chalk.green("✓ Git repository initialized in ~/.claude"));
      }
      
      // Save default configuration
      const configSpinner = ora ? ora("Creating configuration file...").start() : null;
      if (!ora) console.log(chalk.gray("Creating configuration file..."));
      
      const config = getDefaultConfig();
      await saveConfig(config);
      
      if (ora && configSpinner) {
        configSpinner.succeed("Configuration file created");
      } else {
        console.log(chalk.green("✓ Configuration file created"));
      }
      
      console.log();
      console.log(chalk.gray("You can now create branches to manage different configurations:"));
      console.log(chalk.cyan("  ccswitch create slim/minimal"));
      console.log(chalk.cyan("  ccswitch create project/web-app"));
      console.log();
      console.log(chalk.gray("Use 'ccswitch list' to see all branches"));
      console.log(chalk.gray("Use 'ccswitch switch <branch>' to switch between configurations"));
    } else {
      if (ora && initSpinner) {
        initSpinner.info("Git repository already exists in ~/.claude");
      } else {
        console.log(chalk.blue("ℹ Git repository already exists in ~/.claude"));
      }
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