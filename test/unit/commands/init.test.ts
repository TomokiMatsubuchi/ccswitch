import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { init } from "../../../src/commands/init";

// Mock the git module
const mockInitRepository = mock(() => Promise.resolve(true));

mock.module("../../../src/lib/git", () => ({
  initRepository: mockInitRepository
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

describe("init command", () => {
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

  test("should initialize Git repository successfully", async () => {
    await init();
    
    expect(consoleOutput).toContain("[GREEN]✓[/GREEN] Git repository initialized in ~/.claude");
    expect(consoleOutput.some(line => 
      line.includes("You can now create branches")
    )).toBe(true);
  });

  test("should handle when repository already exists", async () => {
    // Mock initRepository to return false (already exists)
    mock.module("../../../src/lib/git", () => ({
      initRepository: mock(() => Promise.resolve(false))
    }));

    await init();
    
    expect(consoleOutput).toContain("[YELLOW]Git repository already exists in ~/.claude[/YELLOW]");
  });

  test("should handle initialization errors", async () => {
    // Mock initRepository to throw an error
    mock.module("../../../src/lib/git", () => ({
      initRepository: mock(() => Promise.reject(new Error("Permission denied")))
    }));

    await init();
    
    expect(consoleOutput[0]).toContain("ERROR:");
    expect(consoleOutput[0]).toContain("Permission denied");
  });

  test("should accept --force flag", async () => {
    await init({ force: true });
    
    expect(consoleOutput.some(line => 
      line.includes("Force initializing")
    )).toBe(true);
  });

});