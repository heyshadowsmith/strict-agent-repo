import { describe, expect, it } from "vitest";
import { Result, Option } from "./main";

describe("main", () => {
  it("re-exports the Result namespace", () => {
    expect(Result.ok(1)).toEqual({ tag: "Ok", value: 1 });
  });

  it("re-exports the Option namespace", () => {
    expect(Option.some(1)).toEqual({ tag: "Some", value: 1 });
  });
});
