import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { switchTo } from "../../../src/commands/switch";

// Mock the git module
const mockSwitchBranch = mock(() => Promise.resolve());
const mockGetCurrentBranch = mock(() => Promise.resolve("main"));

mock.module("../../../src/lib/git", () => ({
  switchBranch: mockSwitchBranch,
  getCurrentBranch: mockGetCurrentBranch
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

describe("switch command", () => {
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

  test("should switch to specified branch", async () => {
    await switchTo("develop");
    
    expect(consoleOutput).toContain("[GREEN]Switched to branch:[/GREEN] [CYAN]develop[/CYAN]");
  });

  test("should display previous branch", async () => {
    await switchTo("develop");
    
    expect(consoleOutput.some(line => 
      line.includes("main") && line.includes("Previous branch")
    )).toBe(true);
  });

  test("should handle non-existent branch error", async () => {
    // Mock switchBranch to throw an error
    const mockSwitchBranchError = mock(() => 
      Promise.reject(new Error("Branch 'non-existent' does not exist"))
    );
    
    mock.module("../../../src/lib/git", () => ({
      switchBranch: mockSwitchBranchError,
      getCurrentBranch: mockGetCurrentBranch
    }));

    await switchTo("non-existent");
    
    expect(consoleOutput[0]).toContain("ERROR:");
    expect(consoleOutput[0]).toContain("does not exist");
  });

  test("should handle git repository error", async () => {
    // Mock switchBranch to throw a repository error
    const mockSwitchBranchError = mock(() => 
      Promise.reject(new Error("not a git repository"))
    );
    
    mock.module("../../../src/lib/git", () => ({
      switchBranch: mockSwitchBranchError,
      getCurrentBranch: mockGetCurrentBranch
    }));

    await switchTo("develop");
    
    expect(consoleOutput[0]).toContain("ERROR:");
    expect(consoleOutput[0]).toContain("~/.claude is not a Git repository");
    expect(consoleOutput[1]).toContain("ccswitch init");
  });

  test("should handle same branch switch gracefully", async () => {
    await switchTo("main");
    
    expect(consoleOutput.some(line => 
      line.includes("Already on branch") && line.includes("main")
    )).toBe(true);
  });
});