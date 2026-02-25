import { describe, expect, it } from "vitest";
import {
  some,
  none,
  isSome,
  isNone,
  fromNullable,
  map,
  flatMap,
  getOrElse,
  match,
  filter,
  toResult,
} from "./option";
import { ok, fail } from "./result";

describe("some", () => {
  it("creates a Some option", () => {
    expect(some(42)).toEqual({ tag: "Some", value: 42 });
  });
});

describe("none", () => {
  it("is the None singleton", () => {
    expect(none).toEqual({ tag: "None" });
  });
});

describe("isSome", () => {
  it("returns true for Some", () => {
    expect(isSome(some(1))).toBe(true);
  });
  it("returns false for None", () => {
    expect(isSome(none)).toBe(false);
  });
});

describe("isNone", () => {
  it("returns true for None", () => {
    expect(isNone(none)).toBe(true);
  });
  it("returns false for Some", () => {
    expect(isNone(some(1))).toBe(false);
  });
});

describe("fromNullable", () => {
  it("wraps a defined value in Some", () => {
    expect(fromNullable(42)).toEqual(some(42));
  });
  it("returns None for undefined", () => {
    expect(fromNullable()).toEqual(none);
  });
});

describe("map", () => {
  it("transforms a Some value", () => {
    expect(map((x: number) => x * 2)(some(5))).toEqual(some(10));
  });
  it("passes None through unchanged", () => {
    expect(map((x: number) => x * 2)(none)).toEqual(none);
  });
});

describe("flatMap", () => {
  it("chains Some into a new Option", () => {
    expect(flatMap((x: number) => some(x + 1))(some(5))).toEqual(some(6));
  });
  it("short-circuits on None", () => {
    expect(flatMap((x: number) => some(x + 1))(none)).toEqual(none);
  });
  it("propagates None returned by transform", () => {
    expect(flatMap(() => none)(some(5))).toEqual(none);
  });
});

describe("getOrElse", () => {
  it("returns the Some value", () => {
    expect(getOrElse(0)(some(42))).toBe(42);
  });
  it("returns the default for None", () => {
    expect(getOrElse(0)(none)).toBe(0);
  });
});

describe("match", () => {
  it("calls onSome for a Some value", () => {
    expect(
      match(
        (x: number) => x * 2,
        () => -1,
      )(some(5)),
    ).toBe(10);
  });
  it("calls onNone for None", () => {
    expect(
      match(
        (x: number) => x * 2,
        () => -1,
      )(none),
    ).toBe(-1);
  });
});

describe("filter", () => {
  it("keeps Some when predicate passes", () => {
    expect(filter((x: number) => x > 3)(some(5))).toEqual(some(5));
  });
  it("returns None when predicate fails", () => {
    expect(filter((x: number) => x > 3)(some(1))).toEqual(none);
  });
  it("returns None for None input", () => {
    expect(filter(() => true)(none)).toEqual(none);
  });
});

describe("toResult", () => {
  it("converts Some to Ok", () => {
    expect(toResult("missing")(some(42))).toEqual(ok(42));
  });
  it("converts None to Failure", () => {
    expect(toResult("missing")(none)).toEqual(fail("missing"));
  });
});
