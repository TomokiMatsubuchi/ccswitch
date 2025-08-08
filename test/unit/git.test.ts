import { describe, expect, test, beforeEach, mock } from "bun:test";
import { getCurrentBranch } from "../../src/lib/git";
import simpleGit, { SimpleGit } from "simple-git";

// Mock simple-git
mock.module("simple-git", () => ({
  default: () => ({
    branch: mock(() => Promise.resolve({
      current: "main",
      all: ["main", "develop", "feature/test"],
      branches: {}
    }))
  })
}));

describe("Git operations", () => {
  describe("getCurrentBranch", () => {
    test("should return the current branch name", async () => {
      const branch = await getCurrentBranch();
      expect(branch).toBe("main");
    });

    test("should return current branch for ~/.claude directory", async () => {
      const branch = await getCurrentBranch("~/.claude");
      expect(branch).toBe("main");
    });

    test("should throw error if not a git repository", async () => {
      // Mock git to throw an error
      mock.module("simple-git", () => ({
        default: () => ({
          branch: mock(() => Promise.reject(new Error("not a git repository")))
        })
      }));

      await expect(getCurrentBranch("/tmp/not-a-repo")).rejects.toThrow(
        "not a git repository"
      );
    });
  });
});