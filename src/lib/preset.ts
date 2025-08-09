import type { CCSwitchConfig, Preset } from "../types/config";

/**
 * プリセット管理クラス
 */
export class PresetManager {
  /**
   * プリセットを名前で取得
   * @param name プリセット名
   * @param config 設定
   * @returns プリセット、見つからない場合はundefined
   */
  getPreset(name: string, config: CCSwitchConfig): Preset | undefined {
    if (!config.presets) {
      return undefined;
    }

    return config.presets.find(preset => preset.name === name);
  }

  /**
   * プロジェクトタイプに対応するプリセットを取得
   * @param projectType プロジェクトタイプ
   * @param config 設定
   * @returns プリセット、見つからない場合はundefined
   */
  getPresetByProjectType(projectType: string, config: CCSwitchConfig): Preset | undefined {
    if (!config.presets) {
      return undefined;
    }

    return config.presets.find(preset => 
      preset.projectTypes?.includes(projectType)
    );
  }

  /**
   * 全てのプリセットを取得
   * @param config 設定
   * @returns プリセットの配列
   */
  listPresets(config: CCSwitchConfig): Preset[] {
    return config.presets || [];
  }

  /**
   * プリセットを追加
   * @param preset 追加するプリセット
   * @param config 設定
   * @returns 更新された設定
   */
  addPreset(preset: Preset, config: CCSwitchConfig): CCSwitchConfig {
    const updatedConfig = { ...config };
    
    if (!updatedConfig.presets) {
      updatedConfig.presets = [];
    } else {
      // 同名のプリセットがある場合は置き換え
      const existingIndex = updatedConfig.presets.findIndex(p => p.name === preset.name);
      if (existingIndex >= 0) {
        updatedConfig.presets = [...updatedConfig.presets];
        updatedConfig.presets[existingIndex] = preset;
        return updatedConfig;
      }
    }

    updatedConfig.presets = [...updatedConfig.presets, preset];
    return updatedConfig;
  }

  /**
   * プリセットを削除
   * @param name 削除するプリセット名
   * @param config 設定
   * @returns 更新された設定
   */
  removePreset(name: string, config: CCSwitchConfig): CCSwitchConfig {
    if (!config.presets) {
      return config;
    }

    const updatedConfig = { ...config };
    updatedConfig.presets = config.presets.filter(preset => preset.name !== name);
    
    return updatedConfig;
  }

  /**
   * デフォルトプリセットを取得
   * @returns デフォルトプリセットの配列
   */
  getDefaultPresets(): Preset[] {
    return [
      {
        name: "minimal",
        branch: "slim/minimal",
        description: "最小構成 - トークン使用量を最小限に",
        projectTypes: ["minimal", "basic"]
      },
      {
        name: "node",
        branch: "project/node-app",
        description: "Node.js/TypeScript向け設定",
        projectTypes: ["node", "npm", "typescript", "javascript"]
      },
      {
        name: "react",
        branch: "project/react-app",
        description: "React向け設定",
        projectTypes: ["react"]
      },
      {
        name: "vue",
        branch: "project/vue-app",
        description: "Vue.js向け設定",
        projectTypes: ["vue"]
      },
      {
        name: "ruby",
        branch: "project/ruby-app",
        description: "Ruby/Rails向け設定",
        projectTypes: ["ruby", "rails"]
      },
      {
        name: "python",
        branch: "project/python-app",
        description: "Python向け設定",
        projectTypes: ["python", "django", "flask"]
      },
      {
        name: "java",
        branch: "project/java-app",
        description: "Java向け設定",
        projectTypes: ["java", "maven", "gradle", "spring"]
      },
      {
        name: "go",
        branch: "project/go-app",
        description: "Go向け設定",
        projectTypes: ["go"]
      },
      {
        name: "rust",
        branch: "project/rust-app",
        description: "Rust向け設定",
        projectTypes: ["rust", "cargo"]
      },
      {
        name: "php",
        branch: "project/php-app",
        description: "PHP向け設定",
        projectTypes: ["php", "composer", "laravel"]
      },
      {
        name: "dotnet",
        branch: "project/dotnet-app",
        description: ".NET/C#向け設定",
        projectTypes: ["dotnet", "csharp"]
      },
      {
        name: "persona-architect",
        branch: "persona/architect",
        description: "アーキテクト向けペルソナ設定",
        projectTypes: []
      },
      {
        name: "persona-frontend",
        branch: "persona/frontend",
        description: "フロントエンド特化ペルソナ設定",
        projectTypes: []
      },
      {
        name: "experimental",
        branch: "experimental/latest",
        description: "実験的な最新機能",
        projectTypes: []
      }
    ];
  }

  /**
   * プリセットをブランチ名から逆引き
   * @param branch ブランチ名
   * @param config 設定
   * @returns プリセット、見つからない場合はundefined
   */
  getPresetByBranch(branch: string, config: CCSwitchConfig): Preset | undefined {
    if (!config.presets) {
      return undefined;
    }

    return config.presets.find(preset => preset.branch === branch);
  }
}