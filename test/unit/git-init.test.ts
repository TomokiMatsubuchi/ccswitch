import { describe, expect, test } from "bun:test";
import { initRepository } from "../../src/lib/git";

describe("initRepository", () => {
  test("initRepository should be a function", () => {
    expect(initRepository).toBeDefined();
    expect(typeof initRepository).toBe("function");
  });

  test("initRepository accepts optional path parameter", () => {
    // Just test that the function signature is correct
    expect(initRepository.length).toBeLessThanOrEqual(1);
  });
});