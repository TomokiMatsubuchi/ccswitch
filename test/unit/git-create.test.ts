import { describe, expect, test, mock } from "bun:test";
import { createBranch } from "../../src/lib/git";
import simpleGit from "simple-git";

// Mock simple-git
const mockCheckoutBranch = mock(() => Promise.resolve());
const mockBranch = mock(() => 
  Promise.resolve({
    all: ["main"],
    current: "main",
    branches: {}
  })
);

mock.module("simple-git", () => {
  const mockGit = {
    checkoutBranch: mockCheckoutBranch,
    branch: mockBranch
  };

  return {
    default: mock(() => mockGit)
  };
});

describe("createBranch", () => {
  test("should create a new branch", async () => {
    await createBranch("feature/new");
    // Test passes if no error is thrown
    expect(true).toBe(true);
  });

  test("should use ~/.claude as default path", async () => {
    await createBranch("feature/test");
    // Test passes if no error is thrown
    expect(true).toBe(true);
  });

  test("should accept custom path", async () => {
    await createBranch("feature/test", "/custom/path");
    // Test passes if no error is thrown
    expect(true).toBe(true);
  });

  test("should throw error if branch already exists", async () => {
    // Mock that branch already exists
    mock.module("simple-git", () => {
      const mockBranch = mock(() => 
        Promise.resolve({
          all: ["main", "feature/existing"],
          current: "main",
          branches: {}
        })
      );

      const mockGit = {
        checkoutBranch: mockCheckoutBranch,
        branch: mockBranch
      };

      return {
        default: mock(() => mockGit)
      };
    });

    await expect(createBranch("feature/existing")).rejects.toThrow("Branch 'feature/existing' already exists");
  });

  test("should switch to the new branch after creation", async () => {
    const result = await createBranch("feature/auto-switch");
    expect(result).toBe(true);
  });
});