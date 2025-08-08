import { describe, expect, test } from "bun:test";

describe("Bun test environment", () => {
  test("should run tests", () => {
    expect(1 + 1).toBe(2);
  });

  test("should support async tests", async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });
});