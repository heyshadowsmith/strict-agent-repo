import { describe, expect, it } from "vitest";
import { greet } from "./main";

describe("greet", () => {
  it("returns a greeting with the given name", () => {
    expect(greet("world")).toBe("Hello, world!");
  });

  it("works with any name", () => {
    expect(greet("Alice")).toBe("Hello, Alice!");
  });
});
