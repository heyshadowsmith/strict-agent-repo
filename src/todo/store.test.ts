import { afterEach, describe, expect, it } from "vitest";
import {
  clearTodos,
  createTodo,
  deleteTodo,
  getTodo,
  listTodos,
  updateTodo,
} from "./store";

afterEach(() => {
  clearTodos();
});

describe("listTodos", () => {
  it("returns an empty array when no todos exist", () => {
    expect(listTodos()).toEqual([]);
  });

  it("returns all todos", () => {
    createTodo({ title: "Buy milk" });
    createTodo({ title: "Walk the dog" });
    expect(listTodos()).toHaveLength(2);
  });
});

describe("getTodo", () => {
  it("returns the todo for a given id", () => {
    const todo = createTodo({ title: "Buy milk" });
    expect(getTodo(todo.id)).toEqual(todo);
  });

  it("returns undefined for an unknown id", () => {
    expect(getTodo("unknown")).toBeUndefined();
  });
});

describe("createTodo", () => {
  it("creates a todo with the correct fields", () => {
    const todo = createTodo({ title: "Buy milk" });
    expect(todo).toMatchObject({ title: "Buy milk", completed: false });
    expect(typeof todo.id).toBe("string");
    expect(typeof todo.createdAt).toBe("string");
  });
});

describe("updateTodo", () => {
  it("returns undefined for an unknown id", () => {
    expect(updateTodo("unknown", { title: "New title" })).toBeUndefined();
  });

  it("updates the title only", () => {
    const todo = createTodo({ title: "Buy milk" });
    const updated = updateTodo(todo.id, { title: "Buy almond milk" });
    expect(updated?.title).toBe("Buy almond milk");
    expect(updated?.completed).toBe(false);
  });

  it("updates completed only", () => {
    const todo = createTodo({ title: "Buy milk" });
    const updated = updateTodo(todo.id, { completed: true });
    expect(updated?.completed).toBe(true);
    expect(updated?.title).toBe("Buy milk");
  });

  it("updates both title and completed", () => {
    const todo = createTodo({ title: "Buy milk" });
    const updated = updateTodo(todo.id, { title: "New", completed: true });
    expect(updated?.title).toBe("New");
    expect(updated?.completed).toBe(true);
  });

  it("preserves all fields when given an empty update", () => {
    const todo = createTodo({ title: "Buy milk" });
    const updated = updateTodo(todo.id, {});
    expect(updated?.id).toBe(todo.id);
    expect(updated?.title).toBe("Buy milk");
    expect(updated?.completed).toBe(false);
    expect(updated?.createdAt).toBe(todo.createdAt);
  });
});

describe("deleteTodo", () => {
  it("deletes a todo and returns true", () => {
    const todo = createTodo({ title: "Buy milk" });
    expect(deleteTodo(todo.id)).toBe(true);
    expect(getTodo(todo.id)).toBeUndefined();
  });

  it("returns false for an unknown id", () => {
    expect(deleteTodo("unknown")).toBe(false);
  });
});
