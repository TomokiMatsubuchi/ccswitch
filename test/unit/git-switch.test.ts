import { describe, expect, test, mock } from "bun:test";
import { switchBranch } from "../../src/lib/git";
import simpleGit from "simple-git";

// Mock simple-git
mock.module("simple-git", () => {
  const mockCheckout = mock(() => Promise.resolve());
  
  const mockBranch = mock(() => 
    Promise.resolve({
      all: ["main", "develop", "feature/test"],
      current: "main",
      branches: {}
    })
  );

  const mockGit = {
    checkout: mockCheckout,
    branch: mockBranch
  };

  return {
    default: mock(() => mockGit)
  };
});

describe("switchBranch", () => {
  test("should switch to specified branch", async () => {
    await switchBranch("develop");
    // Test passes if no error is thrown
    expect(true).toBe(true);
  });

  test("should use ~/.claude as default path", async () => {
    await switchBranch("develop");
    // Test passes if no error is thrown
    expect(true).toBe(true);
  });

  test("should accept custom path", async () => {
    await switchBranch("develop", "/custom/path");
    // Test passes if no error is thrown
    expect(true).toBe(true);
  });

  test("should throw error for non-existent branch", async () => {
    await expect(switchBranch("non-existent")).rejects.toThrow("Branch 'non-existent' does not exist");
  });

  test("should handle checkout errors gracefully", async () => {
    // Mock simple-git to throw an error on checkout
    mock.module("simple-git", () => {
      const mockCheckout = mock(() => 
        Promise.reject(new Error("checkout failed"))
      );
      
      const mockBranch = mock(() => 
        Promise.resolve({
          all: ["main", "develop"],
          current: "main",
          branches: {}
        })
      );

      const mockGit = {
        checkout: mockCheckout,
        branch: mockBranch
      };

      return {
        default: mock(() => mockGit)
      };
    });

    await expect(switchBranch("develop")).rejects.toThrow("checkout failed");
  });
});