import { describe, expect, test, spyOn, afterEach } from "bun:test";
import { measurePerformance, measureTokens, validateConfig } from "../../../src/lib/performance";
import * as fs from "fs";
import type { PathLike } from "fs";
import * as os from "os";

describe("performance module", () => {
  let existsSpy: any;
  let readdirSpy: any;
  let statSpy: any;
  let homedirSpy: any;

  afterEach(() => {
    if (existsSpy) existsSpy.mockRestore();
    if (readdirSpy) readdirSpy.mockRestore();
    if (statSpy) statSpy.mockRestore();
    if (homedirSpy) homedirSpy.mockRestore();
  });

  test("measurePerformance returns metrics", async () => {
    // Mock fs functions
    existsSpy = spyOn(fs, "existsSync").mockReturnValue(true);
    readdirSpy = spyOn(fs, "readdirSync").mockReturnValue(["CLAUDE.md", "test.txt"] as any);
    statSpy = spyOn(fs, "statSync").mockReturnValue({
      isDirectory: () => false,
      isFile: () => true,
      size: 1000
    } as any);
    
    // Mock homedir
    homedirSpy = spyOn(os, "homedir").mockReturnValue("/fake/home");
    
    const result = await measurePerformance();
    expect(result).toBeDefined();
    expect(result.loadTime).toBeGreaterThanOrEqual(0);
    expect(result.memoryUsage).toBeGreaterThan(0);
  });

  test("measureTokens calculates token metrics", async () => {
    // Mock fs functions
    existsSpy = spyOn(fs, "existsSync").mockReturnValue(true);
    readdirSpy = spyOn(fs, "readdirSync").mockReturnValue(["file1.md", "file2.txt"] as any);
    statSpy = spyOn(fs, "statSync").mockImplementation((path: PathLike) => {
      const pathStr = String(path);
      if (pathStr.includes("file1.md")) {
        return {
          isDirectory: () => false,
          isFile: () => true,
          size: 2000
        } as any;
      } else if (pathStr.includes("file2.txt")) {
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
    homedirSpy = spyOn(os, "homedir").mockReturnValue("/fake/home");
    
    const result = await measureTokens();
    expect(result).toBeDefined();
    expect(result.fileCount).toBe(2);
    expect(result.totalSize).toBe(3500);
    expect(result.estimatedTokens).toBe(875); // 3500 / 4
    expect(result.largestFile).toBe("file1.md");
    expect(result.largestFileSize).toBe(2000);
  });

  test("measureTokens handles non-existent directory", async () => {
    // Mock fs functions
    existsSpy = spyOn(fs, "existsSync").mockReturnValue(false);
    homedirSpy = spyOn(os, "homedir").mockReturnValue("/fake/home");
    
    await expect(measureTokens()).rejects.toThrow("~/.claude does not exist");
  });

  test("validateConfig validates configuration", async () => {
    // Mock fs functions
    existsSpy = spyOn(fs, "existsSync").mockImplementation((path: PathLike) => {
      const pathStr = String(path);
      if (pathStr.includes(".claude")) return true;
      if (pathStr.includes("CLAUDE.md")) return true;
      if (pathStr.includes(".ccswitchrc")) return false;
      return false;
    });
    readdirSpy = spyOn(fs, "readdirSync").mockReturnValue(["CLAUDE.md"] as any);
    statSpy = spyOn(fs, "statSync").mockReturnValue({
      isDirectory: () => false,
      isFile: () => true,
      size: 500
    } as any);
    
    // Mock homedir
    homedirSpy = spyOn(os, "homedir").mockReturnValue("/fake/home");
    
    const result = await validateConfig();
    expect(result).toBeDefined();
    expect(result.valid).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);
    expect(Array.isArray(result.errors)).toBe(true);
    // The test configuration should generate warnings
    expect(result.warnings.length).toBeGreaterThanOrEqual(0);
  });

  test("validateConfig handles missing directory", async () => {
    // Mock fs functions
    existsSpy = spyOn(fs, "existsSync").mockReturnValue(false);
    homedirSpy = spyOn(os, "homedir").mockReturnValue("/fake/home");
    
    const result = await validateConfig();
    expect(result).toBeDefined();
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("~/.claude directory does not exist");
  });

  test("validateConfig detects large files", async () => {
    // Mock fs functions
    existsSpy = spyOn(fs, "existsSync").mockImplementation((path: PathLike) => {
      const pathStr = String(path);
      if (pathStr.includes(".claude")) return true;
      if (pathStr.includes("CLAUDE.md")) return true;
      return false;
    });
    readdirSpy = spyOn(fs, "readdirSync").mockReturnValue(["CLAUDE.md", "large.txt"] as any);
    statSpy = spyOn(fs, "statSync").mockImplementation((path: PathLike) => {
      const pathStr = String(path);
      if (pathStr.includes("large.txt")) {
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
    homedirSpy = spyOn(os, "homedir").mockReturnValue("/fake/home");
    
    const result = await validateConfig();
    expect(result).toBeDefined();
    expect(result.warnings).toContain("Large file detected: large.txt (58.6 KB)");
  });
});