import { describe, expect, it } from "vitest";
import {
  ok,
  fail,
  isOk,
  isFailure,
  map,
  flatMap,
  mapFailure,
  match,
  getOrElse,
  recover,
  fromNullable,
  combine,
} from "./result";

describe("ok", () => {
  it("creates an Ok result", () => {
    expect(ok(42)).toEqual({ tag: "Ok", value: 42 });
  });
});

describe("fail", () => {
  it("creates a Failure result", () => {
    expect(fail("oops")).toEqual({ tag: "Failure", error: "oops" });
  });
});

describe("isOk", () => {
  it("returns true for Ok", () => {
    expect(isOk(ok(1))).toBe(true);
  });
  it("returns false for Failure", () => {
    expect(isOk(fail("e"))).toBe(false);
  });
});

describe("isFailure", () => {
  it("returns true for Failure", () => {
    expect(isFailure(fail("e"))).toBe(true);
  });
  it("returns false for Ok", () => {
    expect(isFailure(ok(1))).toBe(false);
  });
});

describe("map", () => {
  it("transforms an Ok value", () => {
    expect(map((x: number) => x * 2)(ok(5))).toEqual(ok(10));
  });
  it("passes Failure through unchanged", () => {
    expect(map((x: number) => x * 2)(fail("e"))).toEqual(fail("e"));
  });
});

describe("flatMap", () => {
  it("chains Ok into a new Result", () => {
    expect(flatMap((x: number) => ok(x + 1))(ok(5))).toEqual(ok(6));
  });
  it("short-circuits on incoming Failure", () => {
    expect(flatMap((x: number) => ok(x + 1))(fail("e"))).toEqual(fail("e"));
  });
  it("propagates Failure returned by transform", () => {
    expect(flatMap(() => fail("propagated"))(ok(5))).toEqual(
      fail("propagated"),
    );
  });
});

describe("mapFailure", () => {
  it("passes Ok through unchanged", () => {
    expect(
      mapFailure((message: string) => message.toUpperCase())(ok(5)),
    ).toEqual(ok(5));
  });
  it("transforms a Failure value", () => {
    expect(
      mapFailure((message: string) => message.toUpperCase())(fail("oops")),
    ).toEqual(fail("OOPS"));
  });
});

describe("match", () => {
  it("calls onOk for an Ok result", () => {
    expect(
      match(
        (x: number) => x * 2,
        () => -1,
      )(ok(5)),
    ).toBe(10);
  });
  it("calls onError for a Failure result", () => {
    expect(
      match(
        (x: number) => x * 2,
        () => -1,
      )(fail("e")),
    ).toBe(-1);
  });
});

describe("getOrElse", () => {
  it("returns the Ok value", () => {
    expect(getOrElse(0)(ok(42))).toBe(42);
  });
  it("returns the default for Failure", () => {
    expect(getOrElse(0)(fail("e"))).toBe(0);
  });
});

describe("recover", () => {
  it("passes an Ok result through", () => {
    expect(recover(() => 0)(ok(42))).toEqual(ok(42));
  });
  it("converts Failure into Ok via handler", () => {
    expect(recover((message: string) => message.length)(fail("oops"))).toEqual(
      ok(4),
    );
  });
});

describe("fromNullable", () => {
  it("wraps a defined value in Ok", () => {
    expect(fromNullable("missing")(42)).toEqual(ok(42));
  });
  it("returns Failure for undefined", () => {
    expect(fromNullable("missing")()).toEqual(fail("missing"));
  });
});

describe("combine", () => {
  it("collects all Ok values into a single Ok", () => {
    expect(combine([ok(1), ok(2), ok(3)])).toEqual(ok([1, 2, 3]));
  });
  it("returns the first Failure when any result fails", () => {
    expect(combine([ok(1), fail("boom"), ok(3)])).toEqual(fail("boom"));
  });
  it("returns the first of multiple Failures", () => {
    expect(combine([fail("first"), fail("second")])).toEqual(fail("first"));
  });
  it("returns ok([]) for an empty array", () => {
    expect(combine([])).toEqual(ok([]));
  });
});
