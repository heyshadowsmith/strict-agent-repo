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
    expect(map(ok(5), (x: number) => x * 2)).toEqual(ok(10));
  });
  it("passes Failure through unchanged", () => {
    expect(map(fail("e"), (x: number) => x * 2)).toEqual(fail("e"));
  });
});

describe("flatMap", () => {
  it("chains Ok into a new Result", () => {
    expect(flatMap(ok(5), (x: number) => ok(x + 1))).toEqual(ok(6));
  });
  it("short-circuits on incoming Failure", () => {
    expect(flatMap(fail("e"), (x: number) => ok(x + 1))).toEqual(fail("e"));
  });
  it("propagates Failure returned by transform", () => {
    expect(flatMap(ok(5), () => fail("propagated"))).toEqual(
      fail("propagated"),
    );
  });
});

describe("mapFailure", () => {
  it("passes Ok through unchanged", () => {
    expect(
      mapFailure(ok(5), (message: string) => message.toUpperCase()),
    ).toEqual(ok(5));
  });
  it("transforms a Failure value", () => {
    expect(
      mapFailure(fail("oops"), (message: string) => message.toUpperCase()),
    ).toEqual(fail("OOPS"));
  });
});

describe("match", () => {
  it("calls onOk for an Ok result", () => {
    expect(
      match(
        ok(5),
        (x: number) => x * 2,
        () => -1,
      ),
    ).toBe(10);
  });
  it("calls onError for a Failure result", () => {
    expect(
      match(
        fail("e"),
        (x: number) => x * 2,
        () => -1,
      ),
    ).toBe(-1);
  });
});

describe("getOrElse", () => {
  it("returns the Ok value", () => {
    expect(getOrElse(ok(42), 0)).toBe(42);
  });
  it("returns the default for Failure", () => {
    expect(getOrElse(fail("e"), 0)).toBe(0);
  });
});

describe("recover", () => {
  it("passes an Ok result through", () => {
    expect(recover(ok(42), () => 0)).toEqual(ok(42));
  });
  it("converts Failure into Ok via handler", () => {
    expect(recover(fail("oops"), (message: string) => message.length)).toEqual(
      ok(4),
    );
  });
});

describe("fromNullable", () => {
  it("wraps a defined value in Ok", () => {
    expect(fromNullable(42, "missing")).toEqual(ok(42));
  });
  it("returns Failure for undefined", () => {
    expect(fromNullable(undefined, "missing")).toEqual(fail("missing"));
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
