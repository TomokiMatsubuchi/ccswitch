import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { list } from "../../../src/commands/list";

// Mock the git module
mock.module("../../../src/lib/git", () => ({
  getBranches: mock(() => Promise.resolve(["main", "develop", "feature/test"])),
  getCurrentBranch: mock(() => Promise.resolve("main"))
}));

// Mock chalk for color output
mock.module("chalk", () => ({
  default: {
    green: (str: string) => `[GREEN]${str}[/GREEN]`,
    cyan: (str: string) => `[CYAN]${str}[/CYAN]`,
    red: (str: string) => `[RED]${str}[/RED]`,
    yellow: (str: string) => `[YELLOW]${str}[/YELLOW]`,
    gray: (str: string) => `[GRAY]${str}[/GRAY]`
  }
}));

describe("list command", () => {
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

  test("should display list of branches", async () => {
    await list();
    
    expect(consoleOutput).toContain("[GREEN]Available branches:[/GREEN]");
    expect(consoleOutput.some(line => line.includes("main"))).toBe(true);
    expect(consoleOutput.some(line => line.includes("develop"))).toBe(true);
    expect(consoleOutput.some(line => line.includes("feature/test"))).toBe(true);
  });

  test("should highlight current branch", async () => {
    await list();
    
    // The current branch (main) should be highlighted differently
    expect(consoleOutput.some(line => 
      line.includes("main") && line.includes("[CYAN]")
    )).toBe(true);
  });

  test("should handle errors gracefully", async () => {
    // Mock getBranches to throw an error
    mock.module("../../../src/lib/git", () => ({
      getBranches: mock(() => Promise.reject(new Error("not a git repository"))),
      getCurrentBranch: mock(() => Promise.resolve("main"))
    }));

    await list();
    
    expect(consoleOutput[0]).toContain("ERROR:");
    expect(consoleOutput[0]).toContain("~/.claude is not a Git repository");
    expect(consoleOutput[1]).toContain("ccswitch init");
  });

  test("should handle empty branch list", async () => {
    // Mock getBranches to return empty array
    mock.module("../../../src/lib/git", () => ({
      getBranches: mock(() => Promise.resolve([])),
      getCurrentBranch: mock(() => Promise.resolve("main"))
    }));

    await list();
    
    expect(consoleOutput.some(line => 
      line.includes("No branches found")
    )).toBe(true);
  });
});