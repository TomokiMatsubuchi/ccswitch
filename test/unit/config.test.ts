import { describe, expect, test, mock, beforeEach } from "bun:test";
import { loadConfig, saveConfig, getDefaultConfig } from "../../src/lib/config";
import * as fs from "fs";
import * as path from "path";

// Mock fs module
mock.module("fs", () => ({
  existsSync: mock((path: string) => {
    if (path.includes(".ccswitchrc")) return true;
    return false;
  }),
  readFileSync: mock(() => JSON.stringify({
    version: "0.3.0",
    defaultBranch: "main",
    namingConventions: {
      slim: "Minimal configurations",
      project: "Project-specific settings",
      client: "Client-specific settings",
      persona: "Persona-focused settings"
    }
  })),
  writeFileSync: mock(() => undefined),
  mkdirSync: mock(() => undefined)
}));

describe("Config Management", () => {
  test("should load config from ~/.claude/.ccswitchrc", async () => {
    const config = await loadConfig();
    
    expect(config).toBeDefined();
    expect(config.version).toBe("0.3.0");
    expect(config.defaultBranch).toBe("main");
  });

  test("should return default config if file doesn't exist", async () => {
    // Mock that config file doesn't exist
    mock.module("fs", () => ({
      existsSync: mock(() => false),
      writeFileSync: mock(() => undefined),
      mkdirSync: mock(() => undefined)
    }));

    const config = await loadConfig();
    
    expect(config).toBeDefined();
    expect(config.version).toBeDefined();
    expect(config.defaultBranch).toBe("main");
  });

  test("should save config to ~/.claude/.ccswitchrc", async () => {
    const config = {
      version: "0.3.0",
      defaultBranch: "develop",
      namingConventions: {}
    };

    const result = await saveConfig(config);
    
    expect(result).toBe(true);
  });

  test("should get default config", () => {
    const config = getDefaultConfig();
    
    expect(config).toBeDefined();
    expect(config.version).toBe("0.3.0");
    expect(config.defaultBranch).toBe("main");
    expect(config.namingConventions).toBeDefined();
  });
});