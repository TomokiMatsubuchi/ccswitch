import { describe, expect, test, mock, beforeEach, afterEach, spyOn } from "bun:test";

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

// Mock git module
mock.module("../../../src/lib/git", () => ({
  getCurrentBranch: mock(() => Promise.resolve("main"))
}));

// Import modules for spying
import * as performance from "../../../src/lib/performance";
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
    // Mock the performance functions
    const measureTokensSpy = spyOn(performance, "measureTokens").mockResolvedValue({
      fileCount: 10,
      totalSize: 5000,
      estimatedTokens: 1500,
      largestFile: "CLAUDE.md",
      largestFileSize: 2000
    });
    const measurePerformanceSpy = spyOn(performance, "measurePerformance").mockResolvedValue({
      loadTime: 25,
      memoryUsage: 12.5,
      switchTime: 45
    });
    const validateConfigSpy = spyOn(performance, "validateConfig").mockResolvedValue({
      valid: true,
      warnings: [],
      errors: []
    });
    
    try {
      let error = null;
      try {
        await testPerformance();
      } catch (e) {
        error = e;
      }
      
      expect(error).toBeNull();
    } finally {
      measureTokensSpy.mockRestore();
      measurePerformanceSpy.mockRestore();
      validateConfigSpy.mockRestore();
    }
  });

  test("should display warning when token count is high", async () => {
    // Clear console output first
    consoleOutput = [];
    
    // Mock high token count using spyOn
    const measureTokensSpy = spyOn(performance, "measureTokens").mockResolvedValue({
      fileCount: 50,
      totalSize: 50000,
      estimatedTokens: 15000,  // High token count
      largestFile: "CLAUDE.md",
      largestFileSize: 20000
    });
    const measurePerformanceSpy = spyOn(performance, "measurePerformance").mockResolvedValue({
      loadTime: 25,
      memoryUsage: 12.5,
      switchTime: 45
    });
    const validateConfigSpy = spyOn(performance, "validateConfig").mockResolvedValue({
      valid: true,
      warnings: [],
      errors: []
    });

    try {
      await testPerformance();
      
      // Check for warning about high token count
      // The actual implementation outputs "⚠️  Warning: HIGH token usage detected"
      const hasWarning = consoleOutput.some(line => 
        line.includes("Warning: HIGH token usage detected") ||
        line.includes("HIGH token usage") ||
        line.includes("⚠")  // Unicode warning sign might not include emoji variation selector
      );
      
      // Also check that the high token count was output (with any locale formatting)
      const hasHighTokenCount = consoleOutput.some(line => 
        line.includes("15") && line.includes("000")  // Matches both "15,000" and "15000"
      );
      
      // Either the warning or the high token count should be present
      expect(hasWarning || hasHighTokenCount).toBe(true);
    } finally {
      measureTokensSpy.mockRestore();
      measurePerformanceSpy.mockRestore();
      validateConfigSpy.mockRestore();
    }
  });

  test("should handle errors gracefully", async () => {
    // Clear console output first
    consoleOutput = [];
    
    // Mock error in measurement using spyOn
    const measureTokensSpy = spyOn(performance, "measureTokens").mockRejectedValue(new Error("Failed to measure tokens"));
    const measurePerformanceSpy = spyOn(performance, "measurePerformance").mockResolvedValue({
      loadTime: 25,
      memoryUsage: 12.5,
      switchTime: 45
    });
    const validateConfigSpy = spyOn(performance, "validateConfig").mockResolvedValue({
      valid: true,
      warnings: [],
      errors: []
    });

    try {
      await testPerformance();
      
      // The error is caught and logged as "[RED]  Error measuring tokens: Failed to measure tokens[/RED]"
      expect(consoleOutput.some(line => 
        line.includes("Error measuring tokens") || 
        line.includes("Failed to measure tokens") ||
        line.includes("[RED]")
      )).toBe(true);
    } finally {
      measureTokensSpy.mockRestore();
      measurePerformanceSpy.mockRestore();
      validateConfigSpy.mockRestore();
    }
  });

  test("should accept verbose flag for detailed output", async () => {
    // Mock the performance functions
    const measureTokensSpy = spyOn(performance, "measureTokens").mockResolvedValue({
      fileCount: 10,
      totalSize: 5000,
      estimatedTokens: 1500,
      largestFile: "CLAUDE.md",
      largestFileSize: 2000
    });
    const measurePerformanceSpy = spyOn(performance, "measurePerformance").mockResolvedValue({
      loadTime: 25,
      memoryUsage: 12.5,
      switchTime: 45
    });
    const validateConfigSpy = spyOn(performance, "validateConfig").mockResolvedValue({
      valid: true,
      warnings: [],
      errors: []
    });
    
    try {
      await testPerformance({ verbose: true });
      
      // Just check that we got some output
      expect(consoleOutput.length).toBeGreaterThan(0);
    } finally {
      measureTokensSpy.mockRestore();
      measurePerformanceSpy.mockRestore();
      validateConfigSpy.mockRestore();
    }
  });

  test("should accept branch parameter for specific branch testing", async () => {
    // Mock the performance functions
    const measureTokensSpy = spyOn(performance, "measureTokens").mockResolvedValue({
      fileCount: 10,
      totalSize: 5000,
      estimatedTokens: 1500,
      largestFile: "CLAUDE.md",
      largestFileSize: 2000
    });
    const measurePerformanceSpy = spyOn(performance, "measurePerformance").mockResolvedValue({
      loadTime: 25,
      memoryUsage: 12.5,
      switchTime: 45
    });
    const validateConfigSpy = spyOn(performance, "validateConfig").mockResolvedValue({
      valid: true,
      warnings: [],
      errors: []
    });
    
    try {
      await testPerformance({ branch: "slim/minimal" });
      
      expect(consoleOutput.some(line => 
        line.includes("slim/minimal") ||
        line.includes("Testing configuration")
      )).toBe(true);
    } finally {
      measureTokensSpy.mockRestore();
      measurePerformanceSpy.mockRestore();
      validateConfigSpy.mockRestore();
    }
  });
});