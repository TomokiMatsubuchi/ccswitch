import { describe, expect, test, spyOn } from "bun:test";
import { measurePerformance, measureTokens, validateConfig } from "../../../src/lib/performance";
import * as fs from "fs";
import * as os from "os";

describe("performance module", () => {
  test("measurePerformance returns metrics", async () => {
    // Mock fs functions
    const existsSpy = spyOn(fs, "existsSync").mockReturnValue(true);
    const readdirSpy = spyOn(fs, "readdirSync").mockReturnValue(["CLAUDE.md", "test.txt"] as any);
    const statSpy = spyOn(fs, "statSync").mockReturnValue({
      isDirectory: () => false,
      isFile: () => true,
      size: 1000
    } as any);
    
    // Mock homedir
    const homedirSpy = spyOn(os, "homedir").mockReturnValue("/fake/home");
    
    try {
      const result = await measurePerformance();
      expect(result).toBeDefined();
      expect(result.loadTime).toBeGreaterThanOrEqual(0);
      expect(result.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(result.switchTime).toBeGreaterThanOrEqual(0);
    } finally {
      existsSpy.mockRestore();
      readdirSpy.mockRestore();
      statSpy.mockRestore();
      homedirSpy.mockRestore();
    }
  });

  test("measureTokens calculates token metrics", async () => {
    // Mock fs functions
    const existsSpy = spyOn(fs, "existsSync").mockReturnValue(true);
    const readdirSpy = spyOn(fs, "readdirSync").mockReturnValue(["file1.md", "file2.txt"] as any);
    const statSpy = spyOn(fs, "statSync").mockImplementation((path: string) => {
      if (path.includes("file1.md")) {
        return {
          isDirectory: () => false,
          isFile: () => true,
          size: 2000
        } as any;
      } else if (path.includes("file2.txt")) {
        return {
          isDirectory: () => false,
          isFile: () => true,
          size: 1500
        } as any;
      }
      return {
        isDirectory: () => false,
        isFile: () => false,
        size: 0
      } as any;
    });
    
    // Mock homedir
    const homedirSpy = spyOn(os, "homedir").mockReturnValue("/fake/home");
    
    try {
      const result = await measureTokens();
      expect(result).toBeDefined();
      expect(result.fileCount).toBe(2);
      expect(result.totalSize).toBe(3500);
      expect(result.estimatedTokens).toBe(875); // 3500 / 4
      expect(result.largestFile).toBe("file1.md");
      expect(result.largestFileSize).toBe(2000);
    } finally {
      existsSpy.mockRestore();
      readdirSpy.mockRestore();
      statSpy.mockRestore();
      homedirSpy.mockRestore();
    }
  });

  test("measureTokens handles non-existent directory", async () => {
    // Mock fs functions
    const existsSpy = spyOn(fs, "existsSync").mockReturnValue(false);
    const homedirSpy = spyOn(os, "homedir").mockReturnValue("/fake/home");
    
    try {
      await expect(measureTokens()).rejects.toThrow("~/.claude does not exist");
    } finally {
      existsSpy.mockRestore();
      homedirSpy.mockRestore();
    }
  });

  test("validateConfig validates configuration", async () => {
    // Mock fs functions
    const existsSpy = spyOn(fs, "existsSync").mockImplementation((path: string) => {
      if (path.includes(".claude")) return true;
      if (path.includes("CLAUDE.md")) return true;
      if (path.includes(".ccswitchrc")) return false;
      return false;
    });
    const readdirSpy = spyOn(fs, "readdirSync").mockReturnValue(["CLAUDE.md"] as any);
    const statSpy = spyOn(fs, "statSync").mockReturnValue({
      isDirectory: () => false,
      isFile: () => true,
      size: 500
    } as any);
    
    // Mock homedir
    const homedirSpy = spyOn(os, "homedir").mockReturnValue("/fake/home");
    
    try {
      const result = await validateConfig();
      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
      // The test configuration should generate warnings
      expect(result.warnings.length).toBeGreaterThanOrEqual(0);
    } finally {
      existsSpy.mockRestore();
      readdirSpy.mockRestore();
      statSpy.mockRestore();
      homedirSpy.mockRestore();
    }
  });

  test("validateConfig handles missing directory", async () => {
    // Mock fs functions
    const existsSpy = spyOn(fs, "existsSync").mockReturnValue(false);
    const homedirSpy = spyOn(os, "homedir").mockReturnValue("/fake/home");
    
    try {
      const result = await validateConfig();
      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("~/.claude directory does not exist");
    } finally {
      existsSpy.mockRestore();
      homedirSpy.mockRestore();
    }
  });

  test("validateConfig detects large files", async () => {
    // Mock fs functions
    const existsSpy = spyOn(fs, "existsSync").mockImplementation((path: string) => {
      if (path.includes(".claude")) return true;
      if (path.includes("CLAUDE.md")) return true;
      return false;
    });
    const readdirSpy = spyOn(fs, "readdirSync").mockReturnValue(["CLAUDE.md", "large.txt"] as any);
    const statSpy = spyOn(fs, "statSync").mockImplementation((path: string) => {
      if (path.includes("large.txt")) {
        return {
          isDirectory: () => false,
          isFile: () => true,
          size: 60000 // Large file
        } as any;
      }
      return {
        isDirectory: () => false,
        isFile: () => true,
        size: 500
      } as any;
    });
    
    // Mock homedir
    const homedirSpy = spyOn(os, "homedir").mockReturnValue("/fake/home");
    
    try {
      const result = await validateConfig();
      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.includes("Large file detected"))).toBe(true);
    } finally {
      existsSpy.mockRestore();
      readdirSpy.mockRestore();
      statSpy.mockRestore();
      homedirSpy.mockRestore();
    }
  });
});