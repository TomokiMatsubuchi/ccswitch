import { execSync } from "child_process";
import type { Hooks, HookContext } from "../types/config";
import chalk from "chalk";

/**
 * フック管理クラス
 */
export class HookManager {
  /**
   * フックを実行
   * @param hookName フック名
   * @param hooks フック設定
   * @param context 実行コンテキスト
   * @returns 成功した場合はtrue
   */
  async executeHook(
    hookName: keyof Hooks,
    hooks: Hooks | undefined,
    context: HookContext
  ): Promise<boolean> {
    if (!hooks || !hooks[hookName]) {
      return true;
    }

    const hookCommands = hooks[hookName];
    const commands = Array.isArray(hookCommands) ? hookCommands : [hookCommands];

    // 環境変数を準備
    const env = this.prepareEnvironment(context);

    console.log(chalk.gray(`🪝 Executing ${hookName} hook...`));

    for (const command of commands) {
      if (!command || typeof command !== 'string') {
        continue;
      }

      try {
        console.log(chalk.gray(`  → ${command}`));
        
        execSync(command, {
          env: { ...process.env, ...env },
          cwd: context.projectRoot,
          stdio: 'inherit'
        });
        
        console.log(chalk.green(`  ✓ Success`));
      } catch (error) {
        console.error(chalk.red(`  ✗ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
        return false;
      }
    }

    return true;
  }

  /**
   * フックを実行すべきか判定
   * @param hookName フック名
   * @param hooks フック設定
   * @returns 実行すべき場合はtrue
   */
  shouldExecuteHook(hookName: keyof Hooks, hooks: Hooks | undefined): boolean {
    if (!hooks || !hooks[hookName]) {
      return false;
    }

    const hook = hooks[hookName];
    if (Array.isArray(hook)) {
      return hook.length > 0 && hook.every(cmd => !!cmd);
    }

    return !!hook;
  }

  /**
   * フックの妥当性を検証
   * @param hook フック設定
   * @returns 妥当な場合はtrue
   */
  validateHook(hook: string | string[] | undefined): boolean {
    if (!hook) {
      return false;
    }

    if (Array.isArray(hook)) {
      if (hook.length === 0) {
        return false;
      }
      return hook.every(cmd => typeof cmd === 'string' && cmd.trim().length > 0);
    }

    return typeof hook === 'string' && hook.trim().length > 0;
  }

  /**
   * コンテキストから環境変数を準備
   * @param context 実行コンテキスト
   * @returns 環境変数オブジェクト
   */
  private prepareEnvironment(context: HookContext): Record<string, string> {
    const env: Record<string, string> = {
      CCSWITCH_COMMAND: context.command,
      CCSWITCH_PROJECT_ROOT: context.projectRoot,
      CCSWITCH_CLAUDE_DIR: context.claudeDir,
      CCSWITCH_TIMESTAMP: context.timestamp.toISOString()
    };

    if (context.fromBranch) {
      env.CCSWITCH_FROM_BRANCH = context.fromBranch;
    }

    if (context.toBranch) {
      env.CCSWITCH_TO_BRANCH = context.toBranch;
    }

    if (context.environment) {
      Object.assign(env, context.environment);
    }

    return env;
  }

  /**
   * プリセットフックを実行
   * @param hooks フック設定
   * @param context 実行コンテキスト
   * @returns 成功した場合はtrue
   */
  async executePreSwitchHook(hooks: Hooks | undefined, context: HookContext): Promise<boolean> {
    return this.executeHook('preSwitch', hooks, context);
  }

  /**
   * ポストフックを実行
   * @param hooks フック設定
   * @param context 実行コンテキスト
   * @returns 成功した場合はtrue
   */
  async executePostSwitchHook(hooks: Hooks | undefined, context: HookContext): Promise<boolean> {
    return this.executeHook('postSwitch', hooks, context);
  }
}