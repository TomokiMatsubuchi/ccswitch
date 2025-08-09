import { describe, test, expect, beforeEach } from "bun:test";
import { PresetManager } from "../../src/lib/preset";
import type { CCSwitchConfig, Preset } from "../../src/types/config";

describe("PresetManager", () => {
  let manager: PresetManager;
  let config: CCSwitchConfig;

  beforeEach(() => {
    manager = new PresetManager();
    config = {
      version: "1",
      presets: [
        {
          name: "minimal",
          branch: "slim/minimal",
          description: "最小構成",
          projectTypes: ["minimal"]
        },
        {
          name: "node",
          branch: "project/node-app",
          description: "Node.js向け設定",
          projectTypes: ["node", "npm", "typescript"]
        },
        {
          name: "ruby",
          branch: "project/ruby-app",
          description: "Ruby向け設定",
          projectTypes: ["ruby", "rails"]
        }
      ]
    };
  });

  describe("getPreset", () => {
    test("should return preset by name", () => {
      const preset = manager.getPreset("minimal", config);
      
      expect(preset).toBeDefined();
      expect(preset?.name).toBe("minimal");
      expect(preset?.branch).toBe("slim/minimal");
      expect(preset?.description).toBe("最小構成");
    });

    test("should return undefined for non-existent preset", () => {
      const preset = manager.getPreset("nonexistent", config);
      expect(preset).toBeUndefined();
    });

    test("should handle empty presets", () => {
      const emptyConfig: CCSwitchConfig = { version: "1" };
      const preset = manager.getPreset("minimal", emptyConfig);
      expect(preset).toBeUndefined();
    });
  });

  describe("getPresetByProjectType", () => {
    test("should return preset matching project type", () => {
      const preset = manager.getPresetByProjectType("node", config);
      
      expect(preset).toBeDefined();
      expect(preset?.name).toBe("node");
      expect(preset?.branch).toBe("project/node-app");
    });

    test("should return first matching preset for multiple matches", () => {
      const preset = manager.getPresetByProjectType("typescript", config);
      
      expect(preset).toBeDefined();
      expect(preset?.name).toBe("node");
    });

    test("should return undefined for no match", () => {
      const preset = manager.getPresetByProjectType("python", config);
      expect(preset).toBeUndefined();
    });

    test("should handle presets without projectTypes", () => {
      const simpleConfig: CCSwitchConfig = {
        version: "1",
        presets: [
          { name: "test", branch: "test/branch" }
        ]
      };
      
      const preset = manager.getPresetByProjectType("any", simpleConfig);
      expect(preset).toBeUndefined();
    });
  });

  describe("listPresets", () => {
    test("should return all presets", () => {
      const presets = manager.listPresets(config);
      
      expect(presets).toHaveLength(3);
      expect(presets[0].name).toBe("minimal");
      expect(presets[1].name).toBe("node");
      expect(presets[2].name).toBe("ruby");
    });

    test("should return empty array for no presets", () => {
      const emptyConfig: CCSwitchConfig = { version: "1" };
      const presets = manager.listPresets(emptyConfig);
      
      expect(presets).toEqual([]);
    });
  });

  describe("addPreset", () => {
    test("should add new preset", () => {
      const newPreset: Preset = {
        name: "python",
        branch: "project/python-app",
        description: "Python向け設定"
      };

      const updatedConfig = manager.addPreset(newPreset, config);
      
      expect(updatedConfig.presets).toHaveLength(4);
      expect(updatedConfig.presets?.[3].name).toBe("python");
      expect(updatedConfig.presets?.[3].branch).toBe("project/python-app");
    });

    test("should create presets array if not exists", () => {
      const emptyConfig: CCSwitchConfig = { version: "1" };
      const newPreset: Preset = {
        name: "test",
        branch: "test/branch"
      };

      const updatedConfig = manager.addPreset(newPreset, emptyConfig);
      
      expect(updatedConfig.presets).toHaveLength(1);
      expect(updatedConfig.presets?.[0].name).toBe("test");
    });

    test("should replace existing preset with same name", () => {
      const updatedPreset: Preset = {
        name: "minimal",
        branch: "slim/ultra-minimal",
        description: "超最小構成"
      };

      const updatedConfig = manager.addPreset(updatedPreset, config);
      
      expect(updatedConfig.presets).toHaveLength(3);
      const minimal = updatedConfig.presets?.find(p => p.name === "minimal");
      expect(minimal?.branch).toBe("slim/ultra-minimal");
      expect(minimal?.description).toBe("超最小構成");
    });
  });

  describe("removePreset", () => {
    test("should remove preset by name", () => {
      const updatedConfig = manager.removePreset("node", config);
      
      expect(updatedConfig.presets).toHaveLength(2);
      expect(updatedConfig.presets?.find(p => p.name === "node")).toBeUndefined();
    });

    test("should handle removing non-existent preset", () => {
      const updatedConfig = manager.removePreset("nonexistent", config);
      
      expect(updatedConfig.presets).toHaveLength(3);
    });

    test("should handle empty presets", () => {
      const emptyConfig: CCSwitchConfig = { version: "1" };
      const updatedConfig = manager.removePreset("any", emptyConfig);
      
      expect(updatedConfig.presets).toBeUndefined();
    });
  });

  describe("getDefaultPresets", () => {
    test("should return default presets", () => {
      const defaults = manager.getDefaultPresets();
      
      expect(defaults.length).toBeGreaterThan(0);
      
      // 最低限必要なプリセットが含まれているか確認
      const minimal = defaults.find(p => p.name === "minimal");
      expect(minimal).toBeDefined();
      expect(minimal?.branch).toContain("slim");
      
      const node = defaults.find(p => p.name === "node");
      expect(node).toBeDefined();
      expect(node?.projectTypes).toContain("node");
    });
  });
});