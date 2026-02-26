import { Hono } from "hono";
import { afterEach, describe, expect, it } from "vitest";
import { clearTodos } from "./store";
import { todoRouter } from "./router";

const app = new Hono();
app.route("/todos", todoRouter);

const JSON_CONTENT: [string, string][] = [["Content-Type", "application/json"]];

afterEach(() => {
  clearTodos();
});

async function postTodo(title: string): Promise<{ id: string }> {
  const res = await app.request("/todos", {
    method: "POST",
    headers: JSON_CONTENT,
    body: JSON.stringify({ title }),
  });
  return (await res.json()) as unknown as { id: string };
}

describe("GET /todos", () => {
  it("returns an empty array", async () => {
    const res = await app.request("/todos");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});

describe("POST /todos", () => {
  it("creates a todo and returns 201", async () => {
    const res = await app.request("/todos", {
      method: "POST",
      headers: JSON_CONTENT,
      body: JSON.stringify({ title: "Buy milk" }),
    });
    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({
      title: "Buy milk",
      completed: false,
    });
  });

  it("returns 400 for a missing title", async () => {
    const res = await app.request("/todos", {
      method: "POST",
      headers: JSON_CONTENT,
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for a blank title", async () => {
    const res = await app.request("/todos", {
      method: "POST",
      headers: JSON_CONTENT,
      body: JSON.stringify({ title: "  " }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for a null body", async () => {
    const res = await app.request("/todos", {
      method: "POST",
      headers: JSON_CONTENT,
      body: JSON.stringify(null),
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /todos/:id", () => {
  it("returns the todo", async () => {
    const created = await postTodo("Buy milk");
    const res = await app.request(`/todos/${created.id}`);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      id: created.id,
      title: "Buy milk",
    });
  });

  it("returns 404 for an unknown id", async () => {
    const res = await app.request("/todos/unknown");
    expect(res.status).toBe(404);
  });
});

describe("PUT /todos/:id", () => {
  it("updates a todo and returns 200", async () => {
    const created = await postTodo("Buy milk");
    const res = await app.request(`/todos/${created.id}`, {
      method: "PUT",
      headers: JSON_CONTENT,
      body: JSON.stringify({ completed: true }),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ completed: true });
  });

  it("returns 400 for an invalid body", async () => {
    const res = await app.request("/todos/any-id", {
      method: "PUT",
      headers: JSON_CONTENT,
      body: JSON.stringify({ title: 123 }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 for a null body", async () => {
    const res = await app.request("/todos/any-id", {
      method: "PUT",
      headers: JSON_CONTENT,
      body: JSON.stringify(null),
    });
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await app.request("/todos/unknown", {
      method: "PUT",
      headers: JSON_CONTENT,
      body: JSON.stringify({ title: "New title" }),
    });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /todos/:id", () => {
  it("deletes a todo and returns 200", async () => {
    const created = await postTodo("Buy milk");
    const res = await app.request(`/todos/${created.id}`, {
      method: "DELETE",
    });
    expect(res.status).toBe(200);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await app.request("/todos/unknown", {
      method: "DELETE",
    });
    expect(res.status).toBe(404);
  });
});
