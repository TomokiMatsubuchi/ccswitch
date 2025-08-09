import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { create } from "../../../src/commands/create";

// Mock the git module
const mockCreateBranch = mock(() => Promise.resolve(true));
const mockGetCurrentBranch = mock(() => Promise.resolve("main"));

mock.module("../../../src/lib/git", () => ({
  createBranch: mockCreateBranch,
  getCurrentBranch: mockGetCurrentBranch
}));

// Mock ConfigLoader
mock.module("../../../src/lib/configLoader", () => ({
  ConfigLoader: class {
    loadConfig() {
      return {
        version: "1",
        defaultBranch: "main",
        hooks: {}
      };
    }
  }
}));

// Mock HookManager
mock.module("../../../src/lib/hookManager", () => ({
  HookManager: class {
    shouldExecuteHook() { return false; }
    executeHook() { return Promise.resolve(true); }
  }
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

describe("create command", () => {
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

  test("should create a new branch", async () => {
    await create("feature/test");
    
    expect(consoleOutput).toContain("[GREEN]✓[/GREEN] Created branch: [CYAN]feature/test[/CYAN]");
    expect(consoleOutput.some(line => 
      line.includes("Switched to branch")
    )).toBe(true);
  });

  test("should validate branch name format", async () => {
    await create("invalid branch name");
    
    expect(consoleOutput[0]).toContain("ERROR:");
    expect(consoleOutput[0]).toContain("Invalid branch name");
  });

  test("should suggest naming conventions", async () => {
    await create("mybranch");
    
    expect(consoleOutput.some(line => 
      line.includes("slim/") || line.includes("project/") || line.includes("persona/")
    )).toBe(true);
  });

  test("should handle branch already exists error", async () => {
    // Mock createBranch to throw an error
    mock.module("../../../src/lib/git", () => ({
      createBranch: mock(() => 
        Promise.reject(new Error("Branch 'feature/existing' already exists"))
      )
    }));

    await create("feature/existing");
    
    expect(consoleOutput[0]).toContain("ERROR:");
    expect(consoleOutput[0]).toContain("already exists");
  });

  test("should handle git repository error", async () => {
    // Mock createBranch to throw a repository error
    mock.module("../../../src/lib/git", () => ({
      createBranch: mock(() => 
        Promise.reject(new Error("not a git repository"))
      )
    }));

    await create("feature/test");
    
    expect(consoleOutput[0]).toContain("ERROR:");
    expect(consoleOutput[0]).toContain("~/.claude is not a Git repository");
    expect(consoleOutput[1]).toContain("ccswitch init");
  });
});