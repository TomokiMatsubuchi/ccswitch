import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { create } from "../../../src/commands/create";

// Mock the git module
const mockCreateBranch = mock(() => Promise.resolve(true));
const mockGetCurrentBranch = mock(() => Promise.resolve("main"));

mock.module("../../../src/lib/git", () => ({
  createBranch: mockCreateBranch,
  getCurrentBranch: mockGetCurrentBranch
}));

// Mock the IDE module
const mockOpenInIDE = mock(() => Promise.resolve());
const mockDetectIDE = mock(() => Promise.resolve("code"));
const mockGetIDEDisplayName = mock((cmd: string) => cmd === "code" ? "VS Code" : cmd);

mock.module("../../../src/lib/ide", () => ({
  openInIDE: mockOpenInIDE,
  detectIDE: mockDetectIDE,
  getIDEDisplayName: mockGetIDEDisplayName
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
    // Reset mocks
    mockCreateBranch.mockClear();
    mockCreateBranch.mockResolvedValue(true);
    mockDetectIDE.mockClear();
    mockOpenInIDE.mockClear();
  });

  afterEach(() => {
    console.log = originalLog;
    console.error = originalError;
  });

  test("should create a new branch", async () => {
    await create("feature/test", { openInIDE: false });
    
    expect(consoleOutput).toContain("[GREEN]✓[/GREEN] Created branch: [CYAN]feature/test[/CYAN]");
    expect(consoleOutput.some(line => 
      line.includes("Switched to branch")
    )).toBe(true);
  });

  test("should validate branch name format", async () => {
    await create("invalid branch name", { openInIDE: false });
    
    expect(consoleOutput[0]).toContain("ERROR:");
    expect(consoleOutput[0]).toContain("Invalid branch name");
  });

  test("should suggest naming conventions", async () => {
    await create("mybranch", { openInIDE: false });
    
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

    await create("feature/existing", { openInIDE: false });
    
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

    await create("feature/test", { openInIDE: false });
    
    expect(consoleOutput[0]).toContain("ERROR:");
    expect(consoleOutput[0]).toContain("~/.claude is not a Git repository");
    expect(consoleOutput[1]).toContain("ccswitch init");
  });

});