/**
 * .ccswitchrc設定ファイルの型定義
 */

/**
 * プリセット設定
 */
export interface Preset {
  name: string;
  branch: string;
  description?: string;
  projectTypes?: string[];
}

/**
 * フック設定
 */
export interface Hooks {
  preSwitch?: string | string[];
  postSwitch?: string | string[];
  preCreate?: string | string[];
  postCreate?: string | string[];
  // 追加のフックタイミング
  preInit?: string | string[];
  postInit?: string | string[];
  preBackup?: string | string[];
  postBackup?: string | string[];
}

/**
 * フック実行コンテキスト
 */
export interface HookContext {
  command: string;         // 実行中のコマンド名
  fromBranch?: string;     // 切り替え元ブランチ
  toBranch?: string;       // 切り替え先ブランチ
  projectRoot: string;     // プロジェクトルートパス
  claudeDir: string;       // Claudeディレクトリパス
  timestamp: Date;         // 実行時刻
  environment?: Record<string, string>;  // 環境変数
}

/**
 * 自動切り替え設定
 */
export interface AutoSwitchConfig {
  enabled: boolean;
  rules: AutoSwitchRule[];
}

/**
 * 自動切り替えルール
 */
export interface AutoSwitchRule {
  projectType: string;
  branch: string;
  priority?: number;
}

/**
 * カラー設定
 */
export interface ColorConfig {
  enabled: boolean;
  theme?: 'default' | 'minimal' | 'none';
}

/**
 * バックアップ設定
 */
export interface BackupConfig {
  enabled: boolean;
  maxBackups?: number;
  location?: string;
  autoBackup?: boolean;
}

/**
 * .ccswitchrc設定ファイル全体の型
 */
export interface CCSwitchConfig {
  version?: string;
  defaultBranch?: string;
  claudeDir?: string;
  presets?: Preset[];
  hooks?: Hooks;
  autoSwitch?: AutoSwitchConfig;
  colors?: ColorConfig;
  backup?: BackupConfig;
  aliases?: Record<string, string>;
}

/**
 * 設定ファイルのデフォルト値
 */
export const DEFAULT_CONFIG: CCSwitchConfig = {
  version: '1',
  defaultBranch: 'main',
  claudeDir: '~/.claude',
  colors: {
    enabled: true,
    theme: 'default'
  },
  backup: {
    enabled: true,
    maxBackups: 5,
    autoBackup: true
  },
  autoSwitch: {
    enabled: false,
    rules: []
  }
};

/**
 * 設定の優先順位
 */
export enum ConfigPriority {
  DEFAULT = 0,
  GLOBAL = 1,
  LOCAL = 2,
  ENVIRONMENT = 3,
  COMMAND_LINE = 4
}

/**
 * 設定ソース
 */
export interface ConfigSource {
  type: 'default' | 'global' | 'local' | 'env' | 'cli';
  path?: string;
  config: Partial<CCSwitchConfig>;
  priority: ConfigPriority;
}