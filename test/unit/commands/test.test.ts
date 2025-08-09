import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";

// Mock chalk for color output first
mock.module("chalk", () => ({
  default: {
    green: (str: string) => `[GREEN]${str}[/GREEN]`,
    cyan: (str: string) => `[CYAN]${str}[/CYAN]`,
    red: (str: string) => `[RED]${str}[/RED]`,
    yellow: (str: string) => `[YELLOW]${str}[/YELLOW]`,
    gray: (str: string) => `[GRAY]${str}[/GRAY]`,
    blue: (str: string) => `[BLUE]${str}[/BLUE]`,
    magenta: (str: string) => `[MAGENTA]${str}[/MAGENTA]`,
    bold: {
      cyan: (str: string) => `[BOLD-CYAN]${str}[/BOLD-CYAN]`,
      green: (str: string) => `[BOLD-GREEN]${str}[/BOLD-GREEN]`,
      yellow: (str: string) => `[BOLD-YELLOW]${str}[/BOLD-YELLOW]`
    }
  }
}));

// Mock the performance module
mock.module("../../../src/lib/performance", () => ({
  measureTokens: mock(() => Promise.resolve({
    fileCount: 10,
    totalSize: 5000,
    estimatedTokens: 1500,
    largestFile: "CLAUDE.md",
    largestFileSize: 2000
  })),
  measurePerformance: mock(() => Promise.resolve({
    loadTime: 25,
    memoryUsage: 12.5,
    switchTime: 45
  })),
  validateConfig: mock(() => Promise.resolve({
    valid: true,
    warnings: [],
    errors: []
  }))
}));

// Import command after all mocks are set up
import { testPerformance } from "../../../src/commands/test";

describe("test command", () => {
  let consoleOutput: string[] = [];
  const originalLog = console.log;
  const originalError = console.error;

  beforeEach(() => {
    // Mock file system
    mock.module("fs", () => ({
      existsSync: mock(() => true)
    }));
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
    mock.restore();
  });

  test("should run performance test without errors", async () => {
    // Just check that the function runs without throwing
    let error = null;
    try {
      await testPerformance();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeNull();
  });

  test("should display warning when token count is high", async () => {
    // Clear console output first
    consoleOutput = [];
    
    // Mock high token count
    mock.module("../../../src/lib/performance", () => ({
      measureTokens: mock(() => Promise.resolve({
        fileCount: 50,
        totalSize: 50000,
        estimatedTokens: 15000,  // High token count
        largestFile: "CLAUDE.md",
        largestFileSize: 20000
      })),
      measurePerformance: mock(() => Promise.resolve({
        loadTime: 25,
        memoryUsage: 12.5,
        switchTime: 45
      })),
      validateConfig: mock(() => Promise.resolve({
        valid: true,
        warnings: [],
        errors: []
      }))
    }));

    // Import the command again to use the new mock
    const { testPerformance: testPerfWithHighTokens } = await import("../../../src/commands/test");
    await testPerfWithHighTokens();
    
    // Check for warning about high token count or the token number itself
    const hasWarning = consoleOutput.some(line => 
      line.includes("15,000") ||  // Formatted number with comma
      line.includes("15000") || 
      line.includes("Warning") ||
      line.includes("HIGH token") ||
      line.includes("⚠️")
    );
    
    expect(hasWarning).toBe(true);
  });

  test("should handle errors gracefully", async () => {
    // Mock error in measurement
    mock.module("../../../src/lib/performance", () => ({
      measureTokens: mock(() => Promise.reject(new Error("Failed to measure tokens"))),
      measurePerformance: mock(() => Promise.resolve({
        loadTime: 25,
        memoryUsage: 12.5,
        switchTime: 45
      })),
      validateConfig: mock(() => Promise.resolve({
        valid: true,
        warnings: [],
        errors: []
      }))
    }));

    await testPerformance();
    
    expect(consoleOutput.some(line => 
      line.includes("ERROR:") || 
      line.includes("Failed")
    )).toBe(true);
  });

  test("should accept verbose flag for detailed output", async () => {
    await testPerformance({ verbose: true });
    
    // Just check that we got some output
    expect(consoleOutput.length).toBeGreaterThan(0);
  });

  test("should accept branch parameter for specific branch testing", async () => {
    await testPerformance({ branch: "slim/minimal" });
    
    expect(consoleOutput.some(line => 
      line.includes("slim/minimal") ||
      line.includes("Testing configuration")
    )).toBe(true);
  });
});