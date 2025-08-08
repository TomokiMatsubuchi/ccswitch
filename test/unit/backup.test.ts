import { describe, expect, test, mock } from "bun:test";
import { createBackup, restoreBackup, listBackups } from "../../src/lib/backup";
import * as fs from "fs";
import * as path from "path";

// Mock fs module
mock.module("fs", () => ({
  existsSync: mock((path: string) => {
    if (path.includes(".ccswitch-backups")) return true;
    return false;
  }),
  mkdirSync: mock(() => undefined),
  copyFileSync: mock(() => undefined),
  readdirSync: mock(() => ["backup-20250109-120000.tar.gz", "backup-20250108-150000.tar.gz"]),
  statSync: mock(() => ({
    isFile: () => true,
    mtime: new Date()
  }))
}));

// Mock child_process for tar operations
mock.module("child_process", () => ({
  execSync: mock(() => Buffer.from(""))
}));

describe("Backup Management", () => {
  test("should create a backup of current configuration", async () => {
    const backupPath = await createBackup();
    
    expect(backupPath).toBeDefined();
    expect(backupPath).toContain("backup-");
  });

  test("should create backup with custom name", async () => {
    const backupPath = await createBackup("my-backup");
    
    expect(backupPath).toBeDefined();
    expect(backupPath).toContain("my-backup");
  });

  test("should restore a backup", async () => {
    const result = await restoreBackup("backup-20250109-120000.tar.gz");
    
    expect(result).toBe(true);
  });

  test("should list available backups", async () => {
    const backups = await listBackups();
    
    expect(backups).toBeArray();
    expect(backups.length).toBeGreaterThan(0);
    expect(backups[0]).toContain("backup-");
  });

  test("should handle backup directory not existing", async () => {
    // Mock that backup directory doesn't exist
    mock.module("fs", () => ({
      existsSync: mock(() => false),
      mkdirSync: mock(() => undefined),
      readdirSync: mock(() => [])
    }));

    const backups = await listBackups();
    
    expect(backups).toBeArray();
    expect(backups.length).toBe(0);
  });
});