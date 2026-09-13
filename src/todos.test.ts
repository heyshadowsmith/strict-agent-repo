import { describe, expect, it } from "vitest";
import { reduce, remainingCount, type Todo } from "./todos";

const milk: Todo = { id: "1", text: "Buy milk", done: false };
const walk: Todo = { id: "2", text: "Walk dog", done: true };

describe("reduce", () => {
  it("adds a trimmed todo", () => {
    expect(reduce([], { type: "add", id: "1", text: "  Buy milk " })).toEqual([
      milk,
    ]);
  });

  it("ignores blank todos", () => {
    const todos = [milk];
    expect(reduce(todos, { type: "add", id: "2", text: "   " })).toBe(todos);
  });

  it("toggles only the matching todo", () => {
    expect(reduce([milk, walk], { type: "toggle", id: "1" })).toEqual([
      { ...milk, done: true },
      walk,
    ]);
  });

  it("removes the matching todo", () => {
    expect(reduce([milk, walk], { type: "remove", id: "1" })).toEqual([walk]);
  });

  it("clears completed todos", () => {
    expect(reduce([milk, walk], { type: "clear-completed" })).toEqual([milk]);
  });
});

describe("remainingCount", () => {
  it("counts todos that are not done", () => {
    expect(remainingCount([milk, walk])).toBe(1);
  });
});
