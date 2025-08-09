import { describe, expect, test, spyOn } from "bun:test";
import { 
  detectProjectType,
  getProjectFiles
} from "../../../src/lib/projectDetector";
import * as fs from "fs";
import type { PathLike } from "fs";

describe("projectDetector module", () => {
  describe("detectProjectType", () => {
    test("should detect Node.js project with package.json", () => {
      // Spy on fs functions
      const readdirSpy = spyOn(fs, "readdirSync").mockReturnValue(["package.json", "index.js", "node_modules"] as any);
      const existsSpy = spyOn(fs, "existsSync").mockImplementation((filePath: PathLike) => {
        return String(filePath).includes("package.json");
      });
      
      try {
        const result = detectProjectType("/fake/path");
        expect(result.type).toBe("node");
        expect(result.files).toBeDefined();
        expect(Array.isArray(result.files)).toBe(true);
      } finally {
        // Restore spies
        readdirSpy.mockRestore();
        existsSpy.mockRestore();
      }
    });

    test("should detect Ruby project", () => {
      // Spy on fs functions for Ruby project (doesn't require mocking require)
      const readdirSpy = spyOn(fs, "readdirSync").mockReturnValue(["Gemfile", "Gemfile.lock", ".ruby-version"] as any);
      const existsSpy = spyOn(fs, "existsSync").mockImplementation((filePath: PathLike) => {
        const pathStr = String(filePath);
        return pathStr.includes("Gemfile") || pathStr.includes(".ruby-version");
      });
      
      try {
        const result = detectProjectType("/fake/path");
        expect(result.type).toBe("ruby");
        expect(result.confidence).toBeGreaterThan(0);
      } finally {
        // Restore
        readdirSpy.mockRestore();
        existsSpy.mockRestore();
      }
    });

    test("should detect Python project", () => {
      // Spy on fs functions
      const readdirSpy = spyOn(fs, "readdirSync").mockReturnValue(["requirements.txt", "main.py", "setup.py"] as any);
      const existsSpy = spyOn(fs, "existsSync").mockImplementation((filePath: PathLike) => {
        const pathStr = String(filePath);
        return pathStr.includes("requirements.txt") || pathStr.includes("setup.py");
      });
      
      try {
        const result = detectProjectType("/fake/path");
        expect(result.type).toBe("python");
        expect(result.confidence).toBeGreaterThan(0);
      } finally {
        readdirSpy.mockRestore();
        existsSpy.mockRestore();
      }
    });

    test("should handle directory without project files", () => {
      // Spy on fs functions
      const readdirSpy = spyOn(fs, "readdirSync").mockReturnValue(["README.md", "LICENSE"] as any);
      const existsSpy = spyOn(fs, "existsSync").mockReturnValue(false);
      
      try {
        const result = detectProjectType("/fake/path");
        expect(result.type).toBe("unknown");
        expect(result.confidence).toBe(0);
      } finally {
        readdirSpy.mockRestore();
        existsSpy.mockRestore();
      }
    });
  });

  describe("getProjectFiles", () => {
    test("should list project files", () => {
      // Spy on fs functions
      const readdirSpy = spyOn(fs, "readdirSync").mockReturnValue(["file1.js", "file2.ts", ".gitignore", "node_modules"] as any);
      
      try {
        const files = getProjectFiles("/fake/path");
        expect(Array.isArray(files)).toBe(true);
        expect(files.length).toBe(2); // Should exclude .gitignore and node_modules
        expect(files).toContain("file1.js");
        expect(files).toContain("file2.ts");
      } finally {
        readdirSpy.mockRestore();
      }
    });

    test("should handle empty directory", () => {
      // Spy on fs functions  
      const readdirSpy = spyOn(fs, "readdirSync").mockReturnValue([] as any);
      
      try {
        const files = getProjectFiles("/fake/path");
        expect(Array.isArray(files)).toBe(true);
        expect(files.length).toBe(0);
      } finally {
        readdirSpy.mockRestore();
      }
    });
    
    test("should handle read errors gracefully", () => {
      // Spy on fs functions to throw error
      const readdirSpy = spyOn(fs, "readdirSync").mockImplementation(() => {
        throw new Error("Permission denied");
      });
      
      try {
        const files = getProjectFiles("/fake/path");
        expect(Array.isArray(files)).toBe(true);
        expect(files.length).toBe(0); // Should return empty array on error
      } finally {
        readdirSpy.mockRestore();
      }
    });
  });
});