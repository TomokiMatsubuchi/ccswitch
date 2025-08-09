import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import type { Hooks, HookContext } from "../../src/types/config";

// execSyncのモック関数を作成
const mockExecSync = mock((command: string, options?: any) => {
  // エラーをシミュレートする場合
  if (command === "exit 1") {
    throw new Error("Command failed");
  }
  // 通常は成功
  return Buffer.from(`Executed: ${command}`);
});

// child_processをモック
mock.module("child_process", () => ({
  execSync: mockExecSync
}));

// モック後にインポート
import { HookManager } from "../../src/lib/hookManager";

describe("HookManager", () => {
  let hookManager: HookManager;

  beforeEach(() => {
    hookManager = new HookManager();
    // モック関数の呼び出し履歴をクリア
    mockExecSync.mockClear();
  });

  afterEach(() => {
    // モックをクリア
    mockExecSync.mockClear();
  });

  describe("executeHook", () => {
    test("should execute single command hook", async () => {
      const hooks: Hooks = {
        preSwitch: "echo 'Switching branch'"
      };

      const context: HookContext = {
        command: "switch",
        fromBranch: "main",
        toBranch: "develop",
        projectRoot: "/test/project",
        claudeDir: "~/.claude",
        timestamp: new Date()
      };

      const result = await hookManager.executeHook("preSwitch", hooks, context);
      
      expect(result).toBe(true);
      expect(mockExecSync).toHaveBeenCalled();
    });

    test("should execute multiple command hooks in sequence", async () => {
      const hooks: Hooks = {
        preSwitch: [
          "echo 'Step 1'",
          "echo 'Step 2'",
          "echo 'Step 3'"
        ]
      };

      const context: HookContext = {
        command: "switch",
        fromBranch: "main",
        toBranch: "develop",
        projectRoot: "/test/project",
        claudeDir: "~/.claude",
        timestamp: new Date()
      };

      const result = await hookManager.executeHook("preSwitch", hooks, context);
      
      expect(result).toBe(true);
      expect(mockExecSync).toHaveBeenCalledTimes(3);
    });

    test("should handle hook execution failure gracefully", async () => {
      const hooks: Hooks = {
        preSwitch: "exit 1"  // このコマンドはモックでエラーを発生させる
      };

      const context: HookContext = {
        command: "switch",
        fromBranch: "main",
        toBranch: "develop",
        projectRoot: "/test/project",
        claudeDir: "~/.claude",
        timestamp: new Date()
      };

      const result = await hookManager.executeHook("preSwitch", hooks, context);
      
      expect(result).toBe(false);
    });

    test("should skip execution when hook is not defined", async () => {
      const hooks: Hooks = {};

      const context: HookContext = {
        command: "switch",
        fromBranch: "main",
        toBranch: "develop",
        projectRoot: "/test/project",
        claudeDir: "~/.claude",
        timestamp: new Date()
      };

      const result = await hookManager.executeHook("preSwitch", hooks, context);
      
      expect(result).toBe(true);
      expect(mockExecSync).not.toHaveBeenCalled();
    });

    test("should pass context variables as environment variables", async () => {
      const hooks: Hooks = {
        postSwitch: "echo $CCSWITCH_FROM_BRANCH"
      };

      const context: HookContext = {
        command: "switch",
        fromBranch: "main",
        toBranch: "develop",
        projectRoot: "/test/project",
        claudeDir: "~/.claude",
        timestamp: new Date()
      };

      await hookManager.executeHook("postSwitch", hooks, context);
      
      expect(mockExecSync).toHaveBeenCalled();
      // 環境変数が渡されていることを確認
      const callArgs = mockExecSync.mock.calls[0];
      expect(callArgs[1].env).toBeDefined();
      expect(callArgs[1].env.CCSWITCH_FROM_BRANCH).toBe("main");
      expect(callArgs[1].env.CCSWITCH_TO_BRANCH).toBe("develop");
    });
  });

  describe("shouldExecuteHook", () => {
    test("should return true when hook is defined", () => {
      const hooks: Hooks = {
        preSwitch: "echo 'test'"
      };

      expect(hookManager.shouldExecuteHook("preSwitch", hooks)).toBe(true);
    });

    test("should return false when hook is not defined", () => {
      const hooks: Hooks = {};

      expect(hookManager.shouldExecuteHook("preSwitch", hooks)).toBe(false);
    });

    test("should return false when hooks is undefined", () => {
      expect(hookManager.shouldExecuteHook("preSwitch", undefined)).toBe(false);
    });
  });

  describe("validateHook", () => {
    test("should validate single command", () => {
      const hook = "echo 'test'";
      expect(hookManager.validateHook(hook)).toBe(true);
    });

    test("should validate array of commands", () => {
      const hooks = ["echo 'test'", "ls -la"];
      expect(hookManager.validateHook(hooks)).toBe(true);
    });

    test("should reject empty command", () => {
      expect(hookManager.validateHook("")).toBe(false);
    });

    test("should reject empty array", () => {
      expect(hookManager.validateHook([])).toBe(false);
    });

    test("should reject invalid commands in array", () => {
      const hooks = ["echo 'test'", ""];
      expect(hookManager.validateHook(hooks)).toBe(false);
    });
  });
});