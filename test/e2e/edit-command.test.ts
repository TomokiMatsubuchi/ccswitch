import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const exec = promisify(require("child_process").exec);

// Test environment setup - より一意性の高いID
const TEST_ID = `${Date.now()}-${process.pid}-${Math.random().toString(36).substring(7)}`;
const TEST_DIR = path.join(os.tmpdir(), `ccswitch-e2e-edit-${TEST_ID}`);
const CLAUDE_DIR = path.join(TEST_DIR, ".claude");
const CLI_PATH = path.join(process.cwd(), "src", "cli.ts");

describe("E2E: Edit Command", () => {
  beforeAll(async () => {
    // Clean up any existing test directory
    if (fs.existsSync(TEST_DIR)) {
      await exec(`rm -rf ${TEST_DIR}`);
    }
    
    // Create test directory
    fs.mkdirSync(TEST_DIR, { recursive: true });
    
    // Initialize ccswitch with proper wait
    await exec(`NODE_ENV=test HOME=${TEST_DIR} bun run ${CLI_PATH} init`);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Create test branches
    await exec(`NODE_ENV=test HOME=${TEST_DIR} bun run ${CLI_PATH} create test/branch1 --no-edit`);
    await exec(`NODE_ENV=test HOME=${TEST_DIR} bun run ${CLI_PATH} create test/branch2 --no-edit`);
    await exec(`NODE_ENV=test HOME=${TEST_DIR} bun run ${CLI_PATH} switch master`);
  });

  afterAll(async () => {
    // Clean up test directory
    if (fs.existsSync(TEST_DIR)) {
      await exec(`rm -rf ${TEST_DIR}`);
    }
  });

  test("edit command without branch should try to open IDE", async () => {
    // Since we can't actually test IDE opening in CI, we just check the command runs
    // In a real environment, this would open the IDE
    const result = await exec(`NODE_ENV=test HOME=${TEST_DIR} bun run ${CLI_PATH} edit`);
    
    // The command should either succeed (if IDE is found) or show an appropriate error
    const output = result.stdout + (result.stderr || "");
    
    // Should mention opening ~/.claude
    expect(output.toLowerCase()).toContain("claude");
  });

  test("edit command with branch should switch and try to open IDE", async () => {
    const result = await exec(`NODE_ENV=test HOME=${TEST_DIR} bun run ${CLI_PATH} edit test/branch1`);
    const output = result.stdout + (result.stderr || "");
    
    // Should mention switching to the branch
    expect(output).toContain("test/branch1");
    
    // Verify we're on the correct branch
    const currentResult = await exec(`NODE_ENV=test HOME=${TEST_DIR} bun run ${CLI_PATH} current`);
    expect(currentResult.stdout).toContain("test/branch1");
  });

  test("edit command with non-existent branch should fail", async () => {
    // The command should succeed (exit code 0) but print an error message
    const result = await exec(`NODE_ENV=test HOME=${TEST_DIR} bun run ${CLI_PATH} edit non-existent-branch 2>&1`).catch(err => err);
    const output = result.stdout || result.message || "";
    
    // Should contain error message about branch not existing
    expect(output.toLowerCase()).toContain("does not exist");
  });
});