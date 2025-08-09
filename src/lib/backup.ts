import { existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { execSync } from "child_process";

// Constants
const DEFAULT_CLAUDE_PATH = ".claude";
const DEFAULT_BACKUP_DIR = ".ccswitch-backups";

/**
 * Generate timestamp string for backup names
 * @returns Timestamp string in format YYYYMMDD-HHMMSS
 */
function getTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");
  
  return `${year}${month}${day}-${hour}${minute}${second}`;
}

/**
 * Create a backup of the current ~/.claude configuration
 * @param name - Optional custom name for the backup
 * @returns Promise<string> - Path to the created backup
 */
export async function createBackup(name?: string): Promise<string> {
  const homeDir = process.env.HOME || homedir();
  const claudePath = join(homeDir, DEFAULT_CLAUDE_PATH);
  const backupDir = join(homeDir, DEFAULT_BACKUP_DIR);
  
  // Ensure backup directory exists
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }
  
  // Generate backup filename
  const timestamp = getTimestamp();
  const backupName = name ? `${name}-${timestamp}.tar.gz` : `backup-${timestamp}.tar.gz`;
  const backupPath = join(backupDir, backupName);
  
  try {
    // Create tar.gz archive of ~/.claude
    execSync(`tar -czf "${backupPath}" -C "${homedir()}" "${DEFAULT_CLAUDE_PATH}"`, {
      stdio: "pipe"
    });
    
    return backupPath;
  } catch (error) {
    throw new Error(`Failed to create backup: ${error}`);
  }
}

/**
 * Restore a backup to ~/.claude
 * @param backupName - Name of the backup file to restore
 * @returns Promise<boolean> - true if restored successfully
 */
export async function restoreBackup(backupName: string): Promise<boolean> {
  const backupDir = join(homedir(), DEFAULT_BACKUP_DIR);
  const backupPath = join(backupDir, backupName);
  
  if (!existsSync(backupPath)) {
    throw new Error(`Backup not found: ${backupName}`);
  }
  
  try {
    // Extract tar.gz archive to home directory
    execSync(`tar -xzf "${backupPath}" -C "${homedir()}"`, {
      stdio: "pipe"
    });
    
    return true;
  } catch (error) {
    throw new Error(`Failed to restore backup: ${error}`);
  }
}

/**
 * List available backups
 * @returns Promise<string[]> - Array of backup filenames
 */
export async function listBackups(): Promise<string[]> {
  const homeDir = process.env.HOME || homedir();
  const backupDir = join(homeDir, DEFAULT_BACKUP_DIR);
  
  if (!existsSync(backupDir)) {
    return [];
  }
  
  try {
    const files = readdirSync(backupDir);
    
    // Filter for .tar.gz files and sort by date (newest first)
    const backups = files
      .filter(file => file.endsWith(".tar.gz"))
      .sort((a, b) => {
        const aPath = join(backupDir, a);
        const bPath = join(backupDir, b);
        const aStat = statSync(aPath);
        const bStat = statSync(bPath);
        return bStat.mtime.getTime() - aStat.mtime.getTime();
      });
    
    return backups;
  } catch (error) {
    console.error("Failed to list backups:", error);
    return [];
  }
}