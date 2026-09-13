import { describe, expect, it } from "vitest";
import { loadTodos, saveTodos } from "./storage";

function storageWith(raw: string | null): Pick<Storage, "getItem"> {
  return { getItem: () => raw };
}

describe("loadTodos", () => {
  it("returns an empty list when nothing is stored", () => {
    expect(loadTodos(storageWith(null))).toEqual([]);
  });

  it("returns an empty list for invalid JSON", () => {
    expect(loadTodos(storageWith("{not json"))).toEqual([]);
  });

  it("returns an empty list when the stored value is not an array", () => {
    expect(loadTodos(storageWith('{"id":"1"}'))).toEqual([]);
  });

  it("keeps only valid todos", () => {
    const stored = [
      { id: "1", text: "Buy milk", done: false },
      null,
      "text",
      {},
      { id: 2, text: "Bad id", done: false },
      { id: "3", done: false },
      { id: "4", text: 4, done: false },
      { id: "5", text: "No done" },
      { id: "6", text: "Bad done", done: "yes" },
    ];
    expect(loadTodos(storageWith(JSON.stringify(stored)))).toEqual([
      { id: "1", text: "Buy milk", done: false },
    ]);
  });
});

describe("saveTodos", () => {
  it("stores todos as JSON", () => {
    const saved = new Map<string, string>();
    const todos = [{ id: "1", text: "Buy milk", done: false }];
    saveTodos({ setItem: (key, value) => saved.set(key, value) }, todos);
    expect(saved.get("todos")).toBe(JSON.stringify(todos));
  });
});
