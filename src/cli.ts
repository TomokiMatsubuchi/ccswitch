#!/usr/bin/env node
import { Command } from "commander";
import { current } from "./commands/current";
import { list } from "./commands/list";
import { switchTo, switchInteractive } from "./commands/switch";
import { init } from "./commands/init";
import { create } from "./commands/create";
import { testPerformance } from "./commands/test";
import { auto } from "./commands/auto";
import { edit } from "./commands/edit";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, "../package.json"), "utf8"));

const program = new Command();

program
  .name("ccswitch")
  .description("Claude Code Switch - Git-based configuration management for ~/.claude\n\n" +
    "  Manage different Claude Code configurations using Git branches.\n" +
    "  Each branch can contain different settings, reducing token usage by 60-70%.")
  .version(packageJson.version)
  .addHelpText("after", `
Examples:
  $ ccswitch init                  Initialize Git repository in ~/.claude
  $ ccswitch create slim/minimal   Create a minimal configuration branch
  $ ccswitch switch                Interactive branch selection
  $ ccswitch switch project/web    Switch to specific branch
  $ ccswitch list                  Show all configuration branches

Naming Conventions:
  slim/*      Minimal configurations for reduced token usage
  project/*   Project-specific configurations
  client/*    Client-specific settings
  persona/*   Persona-focused configurations
  
For more information, visit: https://github.com/yourusername/ccswitch`);

program
  .command("init")
  .description("Initialize Git repository in ~/.claude")
  .option("-f, --force", "Force initialization")
  .action(async (options) => {
    await init(options);
  });

program
  .command("current")
  .description("Show the current Git branch for ~/.claude")
  .action(async () => {
    await current();
  });

program
  .command("list")
  .alias("ls")
  .description("List all Git branches for ~/.claude")
  .action(async () => {
    await list();
  });

program
  .command("switch [branch]")
  .alias("sw")
  .description("Switch to a different Git branch in ~/.claude (interactive if no branch specified)")
  .action(async (branch?: string) => {
    if (branch) {
      await switchTo(branch);
    } else {
      await switchInteractive();
    }
  });

program
  .command("create <branch>")
  .alias("new")
  .description("Create a new Git branch in ~/.claude")
  .option("--no-edit", "Do not open IDE after creating branch")
  .action(async (branch: string, options: any) => {
    await create(branch, { openInIDE: options.edit !== false });
  });

program
  .command("test [branch]")
  .description("Test configuration performance and token usage")
  .option("-v, --verbose", "Show detailed output")
  .action(async (branch?: string, options?: any) => {
    await testPerformance({ branch, verbose: options?.verbose });
  });

program
  .command("auto")
  .description("Automatically detect project type and suggest appropriate branch")
  .option("-v, --verbose", "Show detailed output")
  .option("-y, --yes", "Automatically switch without confirmation")
  .option("--dry-run", "Show what would be done without making changes")
  .action(async (options: any) => {
    await auto({ 
      verbose: options.verbose,
      yes: options.yes,
      dryRun: options.dryRun
    });
  });

program
  .command("edit [branch]")
  .description("Open ~/.claude directory in your IDE (VS Code, Cursor, etc.). Optionally switch to a branch first")
  .action(async (branch?: string) => {
    await edit(branch);
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}