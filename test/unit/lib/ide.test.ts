import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";

// Mock fs module first
const mockExistsSync = mock((path: string) => path !== "/test/path");

mock.module("fs", () => ({
  existsSync: mockExistsSync
}));

// Then import the module to test
import { openInIDE, detectIDE, getIDEDisplayName } from "../../../src/lib/ide";

// Mock child_process exec
const mockExec = mock();

mock.module("child_process", () => ({
  exec: mockExec
}));

// Mock util.promisify
const mockPromisify = mock(() => {
  return async (command: string) => {
    if (command.includes("which code")) {
      return { stdout: "/usr/local/bin/code", stderr: "" };
    }
    if (command.includes("which cursor")) {
      throw new Error("Command failed");
    }
    if (command.includes("which vim")) {
      return { stdout: "/usr/bin/vim", stderr: "" };
    }
    if (command.includes("code ")) {
      return { stdout: "", stderr: "" };
    }
    throw new Error("Command not found");
  };
});

mock.module("util", () => ({
  promisify: mockPromisify
}));

describe("IDE module", () => {
  test("getIDEDisplayName should return correct display names", () => {
    expect(getIDEDisplayName("vscode")).toBe("VS Code");
    expect(getIDEDisplayName("code")).toBe("VS Code");
    expect(getIDEDisplayName("cursor")).toBe("Cursor");
    expect(getIDEDisplayName("vim")).toBe("Vim");
    expect(getIDEDisplayName("nano")).toBe("Nano");
    expect(getIDEDisplayName("unknown")).toBe("unknown");
  });

  test("detectIDE should be a function", () => {
    expect(detectIDE).toBeDefined();
    expect(typeof detectIDE).toBe("function");
  });

  test("openInIDE should be a function", () => {
    expect(openInIDE).toBeDefined();
    expect(typeof openInIDE).toBe("function");
  });
});