import { Hono } from "hono";
import {
  createTodo,
  deleteTodo,
  getTodo,
  listTodos,
  updateTodo,
} from "./store";
import type { CreateTodoInput, UpdateTodoInput } from "./types";

const ID_ROUTE = "/:id" as const;
const NOT_FOUND = { error: "Not found" } as const;

function isCreateTodoInput(value: unknown): value is CreateTodoInput {
  if (typeof value !== "object" || value === null) return false;
  if (!("title" in value)) return false;
  const { title } = value as { title: unknown };
  return typeof title === "string" && title.trim().length > 0;
}

function isUpdateTodoInput(value: unknown): value is UpdateTodoInput {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  const hasValidTitle =
    !("title" in candidate) || typeof candidate["title"] === "string";
  const hasValidCompleted =
    !("completed" in candidate) || typeof candidate["completed"] === "boolean";
  return hasValidTitle && hasValidCompleted;
}

export const todoRouter = new Hono();

todoRouter.get("/", (c) => c.json(listTodos()));

todoRouter.post("/", async (c) => {
  const body = await c.req.json<unknown>();
  if (!isCreateTodoInput(body)) {
    return c.json({ error: "title is required" }, 400);
  }
  return c.json(createTodo(body), 201);
});

todoRouter.get(ID_ROUTE, (c) => {
  const id = c.req.param("id");
  const todo = getTodo(id);
  if (todo === undefined) {
    return c.json(NOT_FOUND, 404);
  }
  return c.json(todo);
});

todoRouter.put(ID_ROUTE, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<unknown>();
  if (!isUpdateTodoInput(body)) {
    return c.json({ error: "Invalid input" }, 400);
  }
  const todo = updateTodo(id, body);
  if (todo === undefined) {
    return c.json(NOT_FOUND, 404);
  }
  return c.json(todo);
});

todoRouter.delete(ID_ROUTE, (c) => {
  const id = c.req.param("id");
  const deleted = deleteTodo(id);
  if (!deleted) {
    return c.json(NOT_FOUND, 404);
  }
  return c.json({ success: true });
});
