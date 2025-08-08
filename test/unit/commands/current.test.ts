import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { current } from "../../../src/commands/current";

// Mock the git module
mock.module("../../../src/lib/git", () => ({
  getCurrentBranch: mock(() => Promise.resolve("main"))
}));

// Mock chalk for color output
mock.module("chalk", () => ({
  default: {
    green: (str: string) => `[GREEN]${str}[/GREEN]`,
    cyan: (str: string) => `[CYAN]${str}[/CYAN]`,
    red: (str: string) => `[RED]${str}[/RED]`,
    yellow: (str: string) => `[YELLOW]${str}[/YELLOW]`
  }
}));

describe("current command", () => {
  let consoleOutput: string[] = [];
  const originalLog = console.log;
  const originalError = console.error;

  beforeEach(() => {
    consoleOutput = [];
    console.log = (...args: any[]) => {
      consoleOutput.push(args.join(" "));
    };
    console.error = (...args: any[]) => {
      consoleOutput.push(`ERROR: ${args.join(" ")}`);
    };
  });

  afterEach(() => {
    console.log = originalLog;
    console.error = originalError;
  });

  test("should display the current branch", async () => {
    await current();
    
    expect(consoleOutput).toContain("[GREEN]Current branch:[/GREEN] [CYAN]main[/CYAN]");
  });


  test("should handle errors gracefully", async () => {
    // Mock getCurrentBranch to throw an error
    mock.module("../../../src/lib/git", () => ({
      getCurrentBranch: mock(() => Promise.reject(new Error("not a git repository")))
    }));

    await current();
    
    expect(consoleOutput[0]).toContain("ERROR:");
    expect(consoleOutput[0]).toContain("~/.claude is not a Git repository");
    expect(consoleOutput[1]).toContain("ERROR:");
    expect(consoleOutput[1]).toContain("ccswitch init");
  });
});