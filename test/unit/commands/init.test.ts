import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";

// Create a more sophisticated ora mock that returns the expected structure
const createMockSpinner = () => {
  const mockSpinner = {
    start: function() { 
      console.log("[SPINNER] Starting..."); 
      return this; 
    },
    succeed: function(text: string) { 
      console.log(`[SUCCESS] ${text}`);
      return this;
    },
    fail: function(text: string) { 
      console.log(`[FAIL] ${text}`);
      return this;
    },
    warn: function(text: string) { 
      console.log(`[WARN] ${text}`);
      return this;
    },
    info: function(text: string) { 
      console.log(`[INFO] ${text}`);
      return this;
    }
  };
  return mockSpinner;
};

// Mock chalk first since it's used by ora's dependencies
mock.module("chalk", () => ({
  default: {
    green: (str: string) => `[GREEN]${str}[/GREEN]`,
    cyan: (str: string) => `[CYAN]${str}[/CYAN]`,
    red: (str: string) => `[RED]${str}[/RED]`,
    yellow: (str: string) => `[YELLOW]${str}[/YELLOW]`,
    gray: (str: string) => `[GRAY]${str}[/GRAY]`,
    blue: (str: string) => `[BLUE]${str}[/BLUE]`,
    // Add properties that ora might use
    bold: {
      cyan: (str: string) => `[BOLD-CYAN]${str}[/BOLD-CYAN]`,
      red: (str: string) => `[BOLD-RED]${str}[/BOLD-RED]`,
      yellow: (str: string) => `[BOLD-YELLOW]${str}[/BOLD-YELLOW]`,
      green: (str: string) => `[BOLD-GREEN]${str}[/BOLD-GREEN]`
    }
  }
}));

// Mock log-symbols
mock.module("log-symbols", () => ({
  default: {
    info: "ℹ",
    success: "✔",
    warning: "⚠",
    error: "✖"
  }
}));

// Mock other ora dependencies  
mock.module("cli-cursor", () => ({
  hide: () => {},
  show: () => {}
}));

mock.module("cli-spinners", () => ({
  default: {
    dots: {
      interval: 80,
      frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
    }
  }
}));

mock.module("is-interactive", () => ({
  default: () => false
}));

mock.module("is-unicode-supported", () => ({
  default: () => true
}));

mock.module("strip-ansi", () => ({
  default: (str: string) => str
}));

mock.module("string-width", () => ({
  default: (str: string) => str.length
}));

mock.module("stdin-discarder", () => ({
  default: {
    start: () => {},
    stop: () => {}
  }
}));

// Now mock ora with all its dependencies mocked
mock.module("ora", () => ({
  default: (options?: any) => createMockSpinner()
}));

// Set NODE_ENV to test as a backup
process.env.NODE_ENV = 'test';

import { init } from "../../../src/commands/init";

// Mock the git module
const mockInitRepository = mock(() => Promise.resolve(true));

mock.module("../../../src/lib/git", () => ({
  initRepository: mockInitRepository
}));

// Mock the backup module
mock.module("../../../src/lib/backup", () => ({
  createBackup: mock(() => Promise.resolve("/path/to/backup.tar.gz"))
}));

// Mock the config module
mock.module("../../../src/lib/config", () => ({
  getDefaultConfig: mock(() => ({
    version: "0.4.0",
    defaultBranch: "main",
    namingConventions: {}
  })),
  saveConfig: mock(() => Promise.resolve(true))
}));

// Chalk is already mocked above

describe("init command", () => {
  let consoleOutput: string[] = [];
  const originalLog = console.log;
  const originalError = console.error;

  beforeEach(() => {
    // Mock fs module
    mock.module("fs", () => ({
      existsSync: mock(() => true) // Assume ~/.claude exists for backup
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

  test("should initialize Git repository successfully", async () => {
    await init();
    
    // Check for expected output (either from ora mock or chalk output)
    expect(consoleOutput.some(line => 
      line.includes("You can now create branches") || 
      line.includes("create slim/minimal") ||
      line.includes("[SUCCESS]") ||
      line.includes("Git repository initialized")
    )).toBe(true);
  });

  test("should handle when repository already exists", async () => {
    // Mock initRepository to return false (already exists)
    mock.module("../../../src/lib/git", () => ({
      initRepository: mock(() => Promise.resolve(false))
    }));

    await init();
    
    expect(consoleOutput.some(line =>
      line.includes("existing branches")
    )).toBe(true);
  });

  test("should handle initialization errors", async () => {
    // Mock initRepository to throw an error
    mock.module("../../../src/lib/git", () => ({
      initRepository: mock(() => Promise.reject(new Error("Permission denied")))
    }));

    await init();
    
    // Find the error message in the output (it might not be the first line due to backup process)
    const errorLine = consoleOutput.find(line => line.includes("ERROR:"));
    expect(errorLine).toBeDefined();
    expect(errorLine).toContain("Permission denied");
  });


});