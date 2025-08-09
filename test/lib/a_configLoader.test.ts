import { describe, test, expect, beforeEach, afterEach } from "bun:test";
// fsモジュールのモックを回避するため、node:fsを直接使用
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { ConfigLoader } from "../../src/lib/configLoader";
import type { CCSwitchConfig } from "../../src/types/config";

describe("ConfigLoader", () => {
  let loader: ConfigLoader;
  // 各テストで異なるディレクトリを使うようにする
  let testDir: string;
  const homeDir = os.homedir();

  beforeEach(() => {
    // 各テストで新しいディレクトリを作成
    testDir = path.join(os.tmpdir(), "ccswitch-test-" + Date.now() + "-" + Math.random());
    // テスト用ディレクトリ作成
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    // デフォルトのloaderを作成
    loader = new ConfigLoader();
  });

  afterEach(() => {
    // テスト用ディレクトリのクリーンアップ
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("loadConfig", () => {
    test("should return default config when no config file exists", () => {
      const config = loader.loadConfig(testDir);
      
      expect(config).toBeDefined();
      expect(config.version).toBe("1");
      expect(config.claudeDir).toBe("~/.claude");
      expect(config.colors?.enabled).toBe(true);
      expect(config.backup?.enabled).toBe(true);
    });

    test("should load local .ccswitchrc file", () => {
      const localConfig: CCSwitchConfig = {
        version: "1",
        defaultBranch: "project/test",
        presets: [
          { name: "minimal", branch: "slim/minimal" }
        ]
      };

      const configPath = path.join(testDir, ".ccswitchrc");
      fs.writeFileSync(configPath, JSON.stringify(localConfig, null, 2));

      const config = loader.loadConfig(testDir);
      
      expect(config.defaultBranch).toBe("project/test");
      expect(config.presets).toHaveLength(1);
      expect(config.presets?.[0].name).toBe("minimal");
    });

    test("should load global config from home directory", () => {
      // テスト用のグローバル設定ファイルを作成
      const testGlobalDir = path.join(testDir, "home");
      fs.mkdirSync(testGlobalDir, { recursive: true });
      
      const globalConfig: CCSwitchConfig = {
        version: "1",
        defaultBranch: "main",
        aliases: {
          "m": "main",
          "d": "develop"
        }
      };

      const globalConfigPath = path.join(testGlobalDir, ".ccswitchrc");
      fs.writeFileSync(globalConfigPath, JSON.stringify(globalConfig, null, 2));

      // テスト用のホームディレクトリを指定してloaderを作成
      const customLoader = new ConfigLoader(testGlobalDir);
      const config = customLoader.loadConfig(testDir);
      
      expect(config.defaultBranch).toBe("main");
      expect(config.aliases?.["m"]).toBe("main");
      expect(config.aliases?.["d"]).toBe("develop");
    });

    test("should merge configs with correct priority", () => {
      // テスト用のグローバル設定
      const testGlobalDir = path.join(testDir, "home2");
      fs.mkdirSync(testGlobalDir, { recursive: true });
      
      const globalConfig: CCSwitchConfig = {
        version: "1",
        defaultBranch: "global-branch",
        aliases: { "g": "global" }
      };
      
      const globalConfigPath = path.join(testGlobalDir, ".ccswitchrc");
      fs.writeFileSync(globalConfigPath, JSON.stringify(globalConfig, null, 2));

      // ローカル設定
      const localConfig: CCSwitchConfig = {
        version: "1",
        defaultBranch: "local-branch",
        colors: { enabled: false }
      };

      const configPath = path.join(testDir, ".ccswitchrc");
      fs.writeFileSync(configPath, JSON.stringify(localConfig, null, 2));

      // テスト用のホームディレクトリを指定してloaderを作成
      const customLoader = new ConfigLoader(testGlobalDir);
      const config = customLoader.loadConfig(testDir);
      
      // ローカル設定が優先される
      expect(config.defaultBranch).toBe("local-branch");
      expect(config.colors?.enabled).toBe(false);
      // グローバル設定も反映される
      expect(config.aliases?.["g"]).toBe("global");
    });
  });

  describe("saveConfig", () => {
    test("should save config to specified path", () => {
      const config: CCSwitchConfig = {
        version: "1",
        defaultBranch: "test-branch",
        presets: [
          { name: "test", branch: "test/branch" }
        ]
      };

      const configPath = path.join(testDir, ".ccswitchrc");
      loader.saveConfig(config, configPath);

      const savedContent = fs.readFileSync(configPath, "utf-8");
      const savedConfig = JSON.parse(savedContent);

      expect(savedConfig.version).toBe("1");
      expect(savedConfig.defaultBranch).toBe("test-branch");
      expect(savedConfig.presets).toHaveLength(1);
    });

    test("should create pretty formatted JSON", () => {
      const config: CCSwitchConfig = {
        version: "1",
        defaultBranch: "main"
      };

      const configPath = path.join(testDir, ".ccswitchrc");
      loader.saveConfig(config, configPath);

      const savedContent = fs.readFileSync(configPath, "utf-8");
      
      // インデントされていることを確認
      expect(savedContent).toContain("  ");
      expect(savedContent).toContain("\"version\": \"1\"");
    });
  });

  describe("findConfigFile", () => {
    test("should find .ccswitchrc in current directory", () => {
      const configPath = path.join(testDir, ".ccswitchrc");
      fs.writeFileSync(configPath, "{}");

      const found = loader.findConfigFile(testDir);
      expect(found).toBe(configPath);
    });

    test("should find .ccswitchrc.json", () => {
      const configPath = path.join(testDir, ".ccswitchrc.json");
      fs.writeFileSync(configPath, "{}");

      const found = loader.findConfigFile(testDir);
      expect(found).toBe(configPath);
    });

    test("should return null when no config file exists", () => {
      const found = loader.findConfigFile(testDir);
      expect(found).toBeNull();
    });

    test("should traverse up directories to find config", () => {
      const parentDir = testDir;
      const childDir = path.join(testDir, "child");
      fs.mkdirSync(childDir, { recursive: true });

      const configPath = path.join(parentDir, ".ccswitchrc");
      fs.writeFileSync(configPath, "{}");

      const found = loader.findConfigFile(childDir);
      expect(found).toBe(configPath);
    });
  });

  describe("resolveAlias", () => {
    test("should resolve alias to branch name", () => {
      const config: CCSwitchConfig = {
        aliases: {
          "m": "main",
          "dev": "develop",
          "feat": "feature/new"
        }
      };

      expect(loader.resolveAlias("m", config)).toBe("main");
      expect(loader.resolveAlias("dev", config)).toBe("develop");
      expect(loader.resolveAlias("feat", config)).toBe("feature/new");
    });

    test("should return original name if not an alias", () => {
      const config: CCSwitchConfig = {
        aliases: {
          "m": "main"
        }
      };

      expect(loader.resolveAlias("develop", config)).toBe("develop");
      expect(loader.resolveAlias("feature/test", config)).toBe("feature/test");
    });

    test("should handle empty aliases", () => {
      const config: CCSwitchConfig = {};

      expect(loader.resolveAlias("m", config)).toBe("m");
    });
  });
});