import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const exec = promisify(require("child_process").exec);

// Test environment setup - 完全に一意なテストディレクトリ
const pid = process.pid;
const hrTime = process.hrtime.bigint();
const randomStr = Math.random().toString(36).substring(7);
const TEST_ID = `${pid}-${hrTime}-${randomStr}`;
const TEST_DIR = path.join(os.tmpdir(), `ccswitch-e2e-${TEST_ID}`);
const CLAUDE_DIR = path.join(TEST_DIR, ".claude");
const CLI_PATH = path.join(process.cwd(), "src", "cli.ts");

describe("E2E: Basic Workflow", () => {
  beforeAll(async () => {
    // Clean up any existing test directory
    if (fs.existsSync(TEST_DIR)) {
      await exec(`rm -rf ${TEST_DIR}`);
    }
    
    // Create test directory
    fs.mkdirSync(TEST_DIR, { recursive: true });
  });

  afterAll(async () => {
    // Clean up test directory
    if (fs.existsSync(TEST_DIR)) {
      await exec(`rm -rf ${TEST_DIR}`);
    }
  });

  test("init command should create ~/.claude directory", async () => {
    // HOME環境変数を使用
    const { stdout, stderr } = await exec(
      `NODE_ENV=test HOME=${TEST_DIR} bun run ${CLI_PATH} init`
    );
    
    // Debug output
    if (!fs.existsSync(CLAUDE_DIR)) {
      console.log("TEST_DIR:", TEST_DIR);
      console.log("CLAUDE_DIR:", CLAUDE_DIR);
      console.log("stdout:", stdout);
      console.log("stderr:", stderr);
      console.log("Directory contents:", fs.readdirSync(TEST_DIR));
    }
    
    // Wait for file system to sync
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if directory exists
    expect(fs.existsSync(CLAUDE_DIR)).toBe(true);
    expect(fs.existsSync(path.join(CLAUDE_DIR, ".git"))).toBe(true);
    expect(stdout.toLowerCase()).toContain("initialized");
  });

  test("create command should create a new branch", async () => {
    const { stdout } = await exec(
      `NODE_ENV=test HOME=${TEST_DIR} bun run ${CLI_PATH} create test/e2e-branch --no-edit`
    );
    
    expect(stdout).toContain("Created branch: test/e2e-branch");
    expect(stdout).toContain("Switched to branch 'test/e2e-branch'");
  });

  test("list command should show created branches", async () => {
    const { stdout } = await exec(
      `NODE_ENV=test HOME=${TEST_DIR} bun run ${CLI_PATH} list`
    );
    
    expect(stdout).toContain("master");
    expect(stdout).toContain("test/e2e-branch");
    expect(stdout).toContain("(current)");
  });

  test("switch command should switch branches", async () => {
    const { stdout } = await exec(
      `NODE_ENV=test HOME=${TEST_DIR} bun run ${CLI_PATH} switch master`
    );
    
    expect(stdout).toContain("Previous branch: test/e2e-branch");
    expect(stdout).toContain("Switched to branch: master");
  });

  test("current command should show current branch", async () => {
    const { stdout } = await exec(
      `NODE_ENV=test HOME=${TEST_DIR} bun run ${CLI_PATH} current`
    );
    
    expect(stdout).toContain("Current branch: master");
  });
});