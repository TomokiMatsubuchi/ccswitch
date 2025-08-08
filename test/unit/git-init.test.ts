import { describe, expect, test, mock, beforeEach } from "bun:test";
import { initRepository } from "../../src/lib/git";
import simpleGit from "simple-git";
import * as fs from "fs";
import * as path from "path";

// Mock fs module
mock.module("fs", () => ({
  existsSync: mock((path: string) => {
    // Mock that ~/.claude exists but is not a Git repo
    if (path.includes(".claude")) return true;
    if (path.includes(".gitignore")) return false;
    if (path.includes(".git")) return false;
    return false;
  }),
  mkdirSync: mock(() => undefined),
  writeFileSync: mock(() => undefined),
  promises: {
    mkdir: mock(() => Promise.resolve())
  }
}));

// Mock simple-git
const mockInit = mock(() => Promise.resolve());
const mockAdd = mock(() => Promise.resolve());
const mockCommit = mock(() => Promise.resolve());
const mockCheckIsRepo = mock(() => Promise.resolve(false));

mock.module("simple-git", () => {
  const mockGit = {
    init: mockInit,
    add: mockAdd,
    commit: mockCommit,
    checkIsRepo: mockCheckIsRepo
  };

  return {
    default: mock(() => mockGit)
  };
});

describe("initRepository", () => {
  test("should initialize Git repository in ~/.claude", async () => {
    const result = await initRepository();
    
    expect(result).toBe(true);
  });

  test("should create ~/.claude if it doesn't exist", async () => {
    // Mock that ~/.claude doesn't exist
    mock.module("fs", () => ({
      existsSync: mock(() => false),
      mkdirSync: mock(() => undefined)
    }));

    const result = await initRepository();
    
    expect(result).toBe(true);
  });

  test("should handle when repository already exists", async () => {
    // Mock that it's already a Git repo
    mock.module("simple-git", () => {
      const mockCheckIsRepo = mock(() => Promise.resolve(true));

      const mockGit = {
        checkIsRepo: mockCheckIsRepo
      };

      return {
        default: mock(() => mockGit)
      };
    });

    const result = await initRepository();
    
    expect(result).toBe(false); // Should return false when already initialized
  });


});