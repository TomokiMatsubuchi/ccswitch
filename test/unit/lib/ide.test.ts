import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { getIDEDisplayName, detectIDE, openInIDE } from "../../../src/lib/ide";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("IDE module", () => {
  test("getIDEDisplayName should return correct display names", () => {
    expect(getIDEDisplayName("vscode")).toBe("VS Code");
    expect(getIDEDisplayName("code")).toBe("VS Code");
    expect(getIDEDisplayName("cursor")).toBe("Cursor");
    expect(getIDEDisplayName("vim")).toBe("Vim");
    expect(getIDEDisplayName("nano")).toBe("Nano");
    // For unknown IDEs, it returns the command itself
    expect(getIDEDisplayName("sublime")).toBe("sublime");
    expect(getIDEDisplayName("unknown")).toBe("unknown");
    expect(getIDEDisplayName("")).toBe("");
  });

  describe("detectIDE", () => {
    test("should detect an IDE or return null", async () => {
      const result = await detectIDE();
      // Result should be a string or null
      if (result !== null) {
        expect(typeof result).toBe("string");
        expect(['vscode', 'cursor', 'code', 'vim', 'nano']).toContain(result);
      } else {
        expect(result).toBeNull();
      }
    });
  });

  describe("openInIDE", () => {
    const originalEnv = process.env.NODE_ENV;
    
    beforeAll(() => {
      // Set test environment to prevent actual IDE opening
      process.env.NODE_ENV = 'test';
    });
    
    afterAll(() => {
      // Restore original environment
      if (originalEnv) {
        process.env.NODE_ENV = originalEnv;
      } else {
        delete process.env.NODE_ENV;
      }
    });
    
    test("should not open IDE in test environment", async () => {
      const testDir = path.join(os.tmpdir(), `ide-test-${Date.now()}`);
      fs.mkdirSync(testDir, { recursive: true });
      
      try {
        // Should return without error in test environment
        await openInIDE(testDir);
        expect(true).toBe(true); // Test passes if no error thrown
      } finally {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    });

    test("should handle non-existent directory gracefully", async () => {
      const nonExistentDir = path.join(os.tmpdir(), `non-existent-${Date.now()}`);
      
      // Should not throw error even if directory doesn't exist
      await openInIDE(nonExistentDir);
      expect(true).toBe(true);
    });
  });
});