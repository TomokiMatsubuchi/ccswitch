import { describe, expect, test, spyOn, beforeEach, afterEach } from "bun:test";
import { 
  detectProjectType,
  getProjectFiles
} from "../../../src/lib/projectDetector";
import * as fs from "fs";
import type { PathLike } from "fs";
import * as path from "path";

describe("projectDetector module", () => {
  describe("detectProjectType", () => {

    test("should detect Node.js project with package.json", () => {
      // Spy on fs functions
      const readdirSpy = spyOn(fs, "readdirSync").mockReturnValue(["package.json", "index.js", "node_modules"] as any);
      const existsSpy = spyOn(fs, "existsSync").mockImplementation((filePath: PathLike) => {
        const pathStr = String(filePath);
        return pathStr.includes("package.json");
      });
      const readFileSpy = spyOn(fs, "readFileSync").mockReturnValue('{"dependencies": {}, "devDependencies": {}}');
      
      try {
        const result = detectProjectType("/fake/path");
        expect(result.type).toBe("node");
        expect(result.files).toBeDefined();
        expect(Array.isArray(result.files)).toBe(true);
      } finally {
        readdirSpy.mockRestore();
        existsSpy.mockRestore();
        readFileSpy.mockRestore();
      }
    });

    test("should detect Ruby project", () => {
      // Spy on fs functions for Ruby project
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
      // Spy on fs functions - empty directory
      const readdirSpy = spyOn(fs, "readdirSync").mockReturnValue([] as any);
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

    test("should detect React project from package.json", () => {
      // Spy on fs functions
      const readdirSpy = spyOn(fs, "readdirSync").mockReturnValue(["package.json", "src"] as any);
      const existsSpy = spyOn(fs, "existsSync").mockImplementation((filePath: PathLike) => {
        const pathStr = String(filePath);
        return pathStr.includes("package.json");
      });
      const readFileSpy = spyOn(fs, "readFileSync").mockReturnValue('{"dependencies": {"react": "^18.0.0", "react-dom": "^18.0.0"}, "devDependencies": {}}');
      
      try {
        const result = detectProjectType("/fake/path");
        expect(result.type).toBe("react");
        expect(result.suggestedBranch).toBe("project/react-app");
      } finally {
        readdirSpy.mockRestore();
        existsSpy.mockRestore();
        readFileSpy.mockRestore();
      }
    });
  });

  describe("getProjectFiles", () => {

    test("should list project files", () => {
      // Spy on fs functions
      const readdirSpy = spyOn(fs, "readdirSync").mockReturnValue(["file1.js", "file2.py"] as any);
      const existsSpy = spyOn(fs, "existsSync").mockReturnValue(true);
      
      try {
        const result = getProjectFiles("/fake/path");
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
      } finally {
        readdirSpy.mockRestore();
        existsSpy.mockRestore();
      }
    });

    test("should handle non-existent directory", () => {
      // Mock readdirSync to throw an error (simulating non-existent directory)
      const readdirSpy = spyOn(fs, "readdirSync").mockImplementation(() => {
        throw new Error("ENOENT: no such file or directory");
      });
      
      try {
        const result = getProjectFiles("/non/existent/path");
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      } finally {
        readdirSpy.mockRestore();
      }
    });
  });
});