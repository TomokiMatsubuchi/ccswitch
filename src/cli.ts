#!/usr/bin/env node
import { Command } from "commander";
import { current } from "./commands/current";
import { list } from "./commands/list";
import { switchTo } from "./commands/switch";
import { init } from "./commands/init";
import { create } from "./commands/create";

const program = new Command();

program
  .name("ccswitch")
  .description("Claude Code configuration switcher - Git-based context management")
  .version("0.3.0");

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
  .command("switch <branch>")
  .alias("sw")
  .description("Switch to a different Git branch in ~/.claude")
  .action(async (branch: string) => {
    await switchTo(branch);
  });

program
  .command("create <branch>")
  .alias("new")
  .description("Create a new Git branch in ~/.claude")
  .action(async (branch: string) => {
    await create(branch);
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}