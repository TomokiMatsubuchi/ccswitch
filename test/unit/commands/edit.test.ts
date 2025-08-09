import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { edit } from "../../../src/commands/edit";
import * as os from "os";
import * as path from "path";

// Mock the IDE opener module
const mockOpenInIDE = mock(() => Promise.resolve(true));
const mockDetectIDE = mock(() => Promise.resolve("vscode"));
const mockGetIDEDisplayName = mock((cmd: string) => "VS Code");

mock.module("../../../src/lib/ide", () => ({
  openInIDE: mockOpenInIDE,
  detectIDE: mockDetectIDE,
  getIDEDisplayName: mockGetIDEDisplayName
}));

// Mock git module
const mockSwitchBranch = mock(() => Promise.resolve());

mock.module("../../../src/lib/git", () => ({
  switchBranch: mockSwitchBranch
}));

// Mock chalk for color output
mock.module("chalk", () => ({
  default: {
    green: (str: string) => `[GREEN]${str}[/GREEN]`,
    cyan: (str: string) => `[CYAN]${str}[/CYAN]`,
    red: (str: string) => `[RED]${str}[/RED]`,
    yellow: (str: string) => `[YELLOW]${str}[/YELLOW]`,
    gray: (str: string) => `[GRAY]${str}[/GRAY]`,
    bold: {
      cyan: (str: string) => `[BOLD_CYAN]${str}[/BOLD_CYAN]`
    }
  }
}));

describe("edit command", () => {
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

  test("edit command should be defined", () => {
    expect(edit).toBeDefined();
    expect(typeof edit).toBe("function");
  });

  test("edit command without branch should open IDE", async () => {
    await edit();
    
    // Since IDE opening is mocked in test environment,
    // we just check that no error occurred
    expect(consoleOutput.some(line => line.includes("ERROR"))).toBe(false);
  });

  test("edit command with branch should switch and open IDE", async () => {
    await edit("test-branch");
    
    expect(consoleOutput.some(line => 
      line.includes("Switching to branch") || line.includes("Switched to branch")
    )).toBe(true);
  });
});