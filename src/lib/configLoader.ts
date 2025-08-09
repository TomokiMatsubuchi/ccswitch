import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { CCSwitchConfig, ConfigSource } from "../types/config";
import { DEFAULT_CONFIG, ConfigPriority } from "../types/config";

/**
 * 設定ファイルの読み込みと管理
 */
export class ConfigLoader {
  private configCache: Map<string, CCSwitchConfig> = new Map();
  private homeDir: string;

  constructor(homeDir?: string) {
    this.homeDir = homeDir || os.homedir();
  }

  /**
   * 設定ファイルを読み込む
   * @param startDir 検索開始ディレクトリ
   * @returns マージされた設定
   */
  loadConfig(startDir: string = process.cwd()): CCSwitchConfig {
    const sources: ConfigSource[] = [];

    // 1. デフォルト設定
    sources.push({
      type: 'default',
      config: DEFAULT_CONFIG,
      priority: 0 as ConfigPriority
    });

    // 2. グローバル設定（ホームディレクトリ）
    const globalConfigPath = path.join(this.homeDir, '.ccswitchrc');
    if (fs.existsSync(globalConfigPath)) {
      try {
        const content = fs.readFileSync(globalConfigPath, 'utf-8');
        const config = JSON.parse(content);
        sources.push({
          type: 'global',
          path: globalConfigPath,
          config,
          priority: 1 as ConfigPriority
        });
      } catch (error) {
        console.warn(`Failed to load global config: ${error}`);
      }
    }

    // 3. ローカル設定（プロジェクトディレクトリ）
    const localConfigPath = this.findConfigFile(startDir);
    if (localConfigPath) {
      try {
        const content = fs.readFileSync(localConfigPath, 'utf-8');
        const config = JSON.parse(content);
        sources.push({
          type: 'local',
          path: localConfigPath,
          config,
          priority: 2 as ConfigPriority
        });
      } catch (error) {
        console.warn(`Failed to load local config: ${error}`);
      }
    }

    // 設定をマージ（優先順位順）
    return this.mergeConfigs(sources);
  }

  /**
   * 設定をファイルに保存
   * @param config 保存する設定
   * @param filePath 保存先パス
   */
  saveConfig(config: CCSwitchConfig, filePath: string): void {
    const content = JSON.stringify(config, null, 2);
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  /**
   * 設定ファイルを検索
   * @param startDir 検索開始ディレクトリ
   * @returns 設定ファイルのパス、見つからない場合はnull
   */
  findConfigFile(startDir: string): string | null {
    const configNames = ['.ccswitchrc', '.ccswitchrc.json'];
    let currentDir = startDir;

    while (true) {
      for (const name of configNames) {
        const configPath = path.join(currentDir, name);
        if (fs.existsSync(configPath)) {
          return configPath;
        }
      }

      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) {
        // ルートディレクトリに到達
        break;
      }
      currentDir = parentDir;
    }

    return null;
  }

  /**
   * エイリアスを解決
   * @param name エイリアスまたはブランチ名
   * @param config 設定
   * @returns 解決されたブランチ名
   */
  resolveAlias(name: string, config: CCSwitchConfig): string {
    if (config.aliases && config.aliases[name]) {
      return config.aliases[name];
    }
    return name;
  }

  /**
   * 複数の設定をマージ
   * @param sources 設定ソースの配列
   * @returns マージされた設定
   */
  private mergeConfigs(sources: ConfigSource[]): CCSwitchConfig {
    // 優先順位でソート
    sources.sort((a, b) => a.priority - b.priority);

    let merged: CCSwitchConfig = {};

    for (const source of sources) {
      merged = this.deepMerge(merged, source.config) as CCSwitchConfig;
    }

    return merged;
  }

  /**
   * オブジェクトを深くマージ
   * @param target マージ先
   * @param source マージ元
   * @returns マージ結果
   */
  private deepMerge(target: any, source: any): any {
    if (source === undefined || source === null) {
      return target;
    }

    if (target === undefined || target === null) {
      return source;
    }

    if (typeof source !== 'object' || Array.isArray(source)) {
      return source;
    }

    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && !Array.isArray(source[key]) && source[key] !== null) {
          result[key] = this.deepMerge(result[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  /**
   * プリセットから設定を取得
   * @param presetName プリセット名
   * @param config 設定
   * @returns プリセット設定、見つからない場合はundefined
   */
  getPreset(presetName: string, config: CCSwitchConfig) {
    if (!config.presets) {
      return undefined;
    }

    return config.presets.find(preset => preset.name === presetName);
  }

  /**
   * 環境変数から設定を読み込む
   * @returns 環境変数ベースの設定
   */
  loadFromEnv(): Partial<CCSwitchConfig> {
    const config: Partial<CCSwitchConfig> = {};

    if (process.env.CCSWITCH_DEFAULT_BRANCH) {
      config.defaultBranch = process.env.CCSWITCH_DEFAULT_BRANCH;
    }

    if (process.env.CCSWITCH_CLAUDE_DIR) {
      config.claudeDir = process.env.CCSWITCH_CLAUDE_DIR;
    }

    if (process.env.CCSWITCH_NO_COLOR) {
      config.colors = { enabled: false };
    }

    if (process.env.CCSWITCH_NO_BACKUP) {
      config.backup = { enabled: false };
    }

    return config;
  }
}