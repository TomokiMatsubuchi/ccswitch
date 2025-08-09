import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";

const execAsync = promisify(exec);

/**
 * Detect available IDE on the system
 * Priority: VS Code > Cursor > vim > nano
 * @returns IDE command name or null if not found
 */
export async function detectIDE(): Promise<string | null> {
  // Priority order: VS Code first, then Cursor, then fallbacks
  // On macOS, check for VS Code app directly to avoid confusion with Cursor's code command
  if (process.platform === "darwin") {
    try {
      // Check if VS Code.app exists
      await execAsync('open -Ra "Visual Studio Code"');
      // If VS Code exists, use the proper command path
      return "vscode";  // Special identifier for VS Code on macOS
    } catch {
      // VS Code not found, continue with other editors
    }
  }
  
  const editors = [
    { command: "cursor", name: "Cursor" },
    { command: "code", name: "Code" },  // Generic code command (might be Cursor's)
    { command: "vim", name: "Vim" },
    { command: "nano", name: "Nano" }
  ];

  for (const editor of editors) {
    try {
      await execAsync(`which ${editor.command}`);
      return editor.command;
    } catch {
      // Continue to next editor
    }
  }

  return null;
}

/**
 * Open a directory in the detected IDE
 * @param dirPath - Path to the directory to open
 * @throws Error if no IDE is found or directory doesn't exist
 */
export async function openInIDE(dirPath: string): Promise<void> {
  // Check if directory exists
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }

  // Detect available IDE
  const ide = await detectIDE();
  
  if (!ide) {
    throw new Error("No IDE found. Please install VS Code, Cursor, or another text editor.");
  }

  // Open the directory in the detected IDE
  try {
    if (process.platform === "darwin") {
      // macOS
      if (ide === "vscode") {
        // Use open command to launch VS Code.app directly on macOS
        await execAsync(`open -a "Visual Studio Code" "${dirPath}"`);
      } else if (ide === "code") {
        // Generic code command (might be Cursor's)
        await execAsync(`code "${dirPath}"`);
      } else if (ide === "cursor") {
        // Cursor on macOS
        await execAsync(`cursor "${dirPath}"`);
      } else {
        // Terminal editors
        console.log(`Opening in ${ide}. Press Ctrl+C to exit the editor.`);
        await execAsync(`${ide} "${dirPath}"`);
      }
    } else if (process.platform === "win32") {
      // Windows
      if (ide === "code") {
        await execAsync(`code "${dirPath}"`);
      } else if (ide === "cursor") {
        await execAsync(`cursor "${dirPath}"`);
      } else {
        // Terminal editors on Windows
        console.log(`Opening in ${ide}. Press Ctrl+C to exit the editor.`);
        await execAsync(`${ide} "${dirPath}"`);
      }
    } else {
      // Linux and other Unix-like systems
      if (ide === "code" || ide === "cursor") {
        await execAsync(`${ide} "${dirPath}"`);
      } else {
        // Terminal editors
        console.log(`Opening in ${ide}. Press Ctrl+C to exit the editor.`);
        await execAsync(`${ide} "${dirPath}"`);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to open IDE: ${error.message}`);
    }
    throw new Error("Failed to open IDE");
  }
}

/**
 * Get the display name for an IDE command
 * @param ideCommand - The IDE command (e.g., "code", "cursor")
 * @returns The display name for the IDE
 */
export function getIDEDisplayName(ideCommand: string): string {
  const displayNames: Record<string, string> = {
    vscode: "VS Code",
    code: "VS Code",
    cursor: "Cursor", 
    vim: "Vim",
    nano: "Nano"
  };
  
  return displayNames[ideCommand] || ideCommand;
}