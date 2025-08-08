import { describe, expect, test, mock, beforeEach } from "bun:test";
import { getBranches } from "../../src/lib/git";
import simpleGit from "simple-git";

// Mock simple-git
mock.module("simple-git", () => {
  const mockBranch = mock(() => 
    Promise.resolve({
      all: ["main", "develop", "feature/test"],
      current: "main",
      branches: {
        main: {
          current: true,
          name: "main",
          commit: "abc123",
          label: "main"
        },
        develop: {
          current: false,
          name: "develop",
          commit: "def456",
          label: "develop"
        },
        "feature/test": {
          current: false,
          name: "feature/test",
          commit: "ghi789",
          label: "feature/test"
        }
      }
    })
  );

  const mockGit = {
    branch: mockBranch
  };

  return {
    default: mock(() => mockGit)
  };
});

describe("getBranches", () => {
  test("should return list of branches", async () => {
    const branches = await getBranches();
    
    expect(branches).toBeArray();
    expect(branches).toContain("main");
    expect(branches).toContain("develop");
    expect(branches).toContain("feature/test");
    expect(branches).toHaveLength(3);
  });

  test("should use ~/.claude as default path", async () => {
    const branches = await getBranches();
    
    expect(branches).toBeArray();
    expect(branches.length).toBeGreaterThan(0);
  });

  test("should accept custom path", async () => {
    const branches = await getBranches("/custom/path");
    
    expect(branches).toBeArray();
    expect(branches).toContain("main");
  });

  test("should handle errors gracefully", async () => {
    // Mock simple-git to throw an error
    mock.module("simple-git", () => {
      const mockBranch = mock(() => 
        Promise.reject(new Error("not a git repository"))
      );

      const mockGit = {
        branch: mockBranch
      };

      return {
        default: mock(() => mockGit)
      };
    });

    await expect(getBranches()).rejects.toThrow("not a git repository");
  });
});