import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// Constants
const DEFAULT_CLAUDE_PATH = ".claude";
const CONFIG_FILE = ".ccswitchrc";

export interface Config {
  version: string;
  defaultBranch: string;
  namingConventions: {
    [key: string]: string;
  };
  autoBackup?: boolean;
  backupDir?: string;
}

/**
 * Get default configuration
 * @returns Default config object
 */
export function getDefaultConfig(): Config {
  return {
    version: "0.3.0",
    defaultBranch: "main",
    namingConventions: {
      "slim": "Minimal configurations",
      "project": "Project-specific settings",
      "client": "Client-specific settings",
      "persona": "Persona-focused settings",
      "experimental": "Experimental configurations"
    },
    autoBackup: true,
    backupDir: ".ccswitch-backups"
  };
}

/**
 * Load configuration from ~/.claude/.ccswitchrc
 * @returns Promise<Config> - Configuration object
 */
export async function loadConfig(): Promise<Config> {
  const homeDir = process.env.HOME || homedir();
  const configPath = join(homeDir, DEFAULT_CLAUDE_PATH, CONFIG_FILE);
  
  if (!existsSync(configPath)) {
    // Return default config if file doesn't exist
    return getDefaultConfig();
  }
  
  try {
    const configData = readFileSync(configPath, "utf-8");
    const config = JSON.parse(configData) as Config;
    
    // Merge with defaults to ensure all fields exist
    return {
      ...getDefaultConfig(),
      ...config
    };
  } catch (error) {
    console.error("Failed to load config, using defaults");
    return getDefaultConfig();
  }
}

/**
 * Save configuration to ~/.claude/.ccswitchrc
 * @param config - Configuration object to save
 * @returns Promise<boolean> - true if saved successfully
 */
export async function saveConfig(config: Config): Promise<boolean> {
  const homeDir = process.env.HOME || homedir();
  const claudePath = join(homeDir, DEFAULT_CLAUDE_PATH);
  const configPath = join(claudePath, CONFIG_FILE);
  
  try {
    // Ensure ~/.claude directory exists
    if (!existsSync(claudePath)) {
      mkdirSync(claudePath, { recursive: true });
    }
    
    // Write config file
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    return true;
  } catch (error) {
    console.error("Failed to save config:", error);
    return false;
  }
}