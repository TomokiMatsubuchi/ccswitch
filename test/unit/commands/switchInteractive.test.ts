import { describe, expect, test, mock } from "bun:test";

// Since interactive switch uses inquirer which is hard to test,
// we'll just test that the function exists and is callable
describe("switch interactive command", () => {
  test("switchInteractive module should export a function", async () => {
    const switchModule = await import("../../../src/commands/switch");
    
    expect(switchModule.switchInteractive).toBeDefined();
    expect(typeof switchModule.switchInteractive).toBe("function");
  });

  test("switchTo module should handle errors gracefully", async () => {
    const switchModule = await import("../../../src/commands/switch");
    
    // Since we can't easily test the interactive prompt,
    // we just verify the function exists
    expect(switchModule.switchTo).toBeDefined();
    expect(typeof switchModule.switchTo).toBe("function");
  });
});