import simpleGit from "simple-git";
import { homedir } from "os";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";

// Constants
const DEFAULT_CLAUDE_PATH = ".claude";

/**
 * Resolves a path string, expanding ~ to home directory
 * @param path - The path to resolve
 * @returns The resolved absolute path
 */
function resolvePath(path: string): string {
  if (path.startsWith("~")) {
    return path.replace("~", homedir());
  }
  return path;
}

/**
 * Get the current Git branch name for the specified repository
 * @param repoPath - Path to the Git repository (defaults to ~/.claude)
 * @returns Promise<string> - The current branch name
 * @throws Error if the path is not a Git repository
 */
export async function getCurrentBranch(repoPath?: string): Promise<string> {
  const homeDir = process.env.HOME || homedir();
  const targetPath = repoPath || join(homeDir, DEFAULT_CLAUDE_PATH);
  const resolvedPath = resolvePath(targetPath);

  try {
    const git = simpleGit(resolvedPath);
    const branchInfo = await git.branch();
    
    if (!branchInfo.current) {
      throw new Error("No current branch found (detached HEAD state?)");
    }
    
    return branchInfo.current;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get current branch: ${error.message}`);
    }
    throw new Error("Failed to get current branch: Unknown error");
  }
}

/**
 * Get list of all Git branches for the specified repository
 * @param repoPath - Path to the Git repository (defaults to ~/.claude)
 * @returns Promise<string[]> - Array of branch names
 * @throws Error if the path is not a Git repository
 */
export async function getBranches(repoPath?: string): Promise<string[]> {
  const homeDir = process.env.HOME || homedir();
  const targetPath = repoPath || join(homeDir, DEFAULT_CLAUDE_PATH);
  const resolvedPath = resolvePath(targetPath);

  try {
    const git = simpleGit(resolvedPath);
    const branchInfo = await git.branch();
    
    return branchInfo.all;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to get branches: ${error.message}`);
    }
    throw new Error("Failed to get branches: Unknown error");
  }
}

/**
 * Switch to a different Git branch
 * @param branchName - Name of the branch to switch to
 * @param repoPath - Path to the Git repository (defaults to ~/.claude)
 * @returns Promise<void>
 * @throws Error if the branch doesn't exist or checkout fails
 */
export async function switchBranch(branchName: string, repoPath?: string): Promise<void> {
  const homeDir = process.env.HOME || homedir();
  const targetPath = repoPath || join(homeDir, DEFAULT_CLAUDE_PATH);
  const resolvedPath = resolvePath(targetPath);

  try {
    const git = simpleGit(resolvedPath);
    
    // First, check if the branch exists
    const branchInfo = await git.branch();
    if (!branchInfo.all.includes(branchName)) {
      throw new Error(`Branch '${branchName}' does not exist`);
    }
    
    // Switch to the branch
    await git.checkout(branchName);
  } catch (error) {
    if (error instanceof Error) {
      // If it's already our custom error, just re-throw it
      if (error.message.includes("does not exist")) {
        throw error;
      }
      throw new Error(`Failed to switch branch: ${error.message}`);
    }
    throw new Error("Failed to switch branch: Unknown error");
  }
}

/**
 * Create a new Git branch
 * @param branchName - Name of the branch to create
 * @param repoPath - Path to the Git repository (defaults to ~/.claude)
 * @returns Promise<boolean> - true if created successfully
 * @throws Error if the branch already exists or creation fails
 */
export async function createBranch(branchName: string, repoPath?: string): Promise<boolean> {
  const homeDir = process.env.HOME || homedir();
  const targetPath = repoPath || join(homeDir, DEFAULT_CLAUDE_PATH);
  const resolvedPath = resolvePath(targetPath);

  try {
    const git = simpleGit(resolvedPath);
    
    // Check if the branch already exists
    const branchInfo = await git.branch();
    if (branchInfo.all.includes(branchName)) {
      throw new Error(`Branch '${branchName}' already exists`);
    }
    
    // Create and checkout the new branch
    await git.checkoutBranch(branchName, branchInfo.current || "HEAD");
    
    return true;
  } catch (error) {
    if (error instanceof Error) {
      // If it's already our custom error, just re-throw it
      if (error.message.includes("already exists")) {
        throw error;
      }
      throw new Error(`Failed to create branch: ${error.message}`);
    }
    throw new Error("Failed to create branch: Unknown error");
  }
}

/**
 * Initialize a Git repository
 * @param repoPath - Path to initialize Git repository (defaults to ~/.claude)
 * @returns Promise<boolean> - true if initialized, false if already exists
 * @throws Error if initialization fails
 */
export async function initRepository(repoPath?: string): Promise<boolean> {
  // Use HOME environment variable if set (for testing), otherwise use homedir()
  const homeDir = process.env.HOME || homedir();
  const targetPath = repoPath || join(homeDir, DEFAULT_CLAUDE_PATH);
  const resolvedPath = resolvePath(targetPath);

  try {
    // Create directory if it doesn't exist
    if (!existsSync(resolvedPath)) {
      mkdirSync(resolvedPath, { recursive: true });
    }

    const git = simpleGit(resolvedPath);
    
    // Check if it's already a Git repository
    const isRepo = await git.checkIsRepo();
    if (isRepo) {
      return false; // Already initialized
    }
    
    // Initialize the repository
    await git.init();
    
    // Create initial .gitignore if needed
    const gitignorePath = join(resolvedPath, ".gitignore");
    if (!existsSync(gitignorePath)) {
      const fs = await import("fs");
      fs.writeFileSync(gitignorePath, "# Claude Code configuration\n.DS_Store\n*.log\n");
    }
    
    // Make initial commit
    await git.add(".");
    await git.commit("Initial commit for Claude Code configuration");
    
    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to initialize Git repository: ${error.message}`);
    }
    throw new Error("Failed to initialize Git repository: Unknown error");
  }
}